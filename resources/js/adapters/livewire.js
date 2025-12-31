/**
 * Livewire Adapter for Laravel Client Validation
 * Provides client-side validation that works seamlessly with Livewire components.
 */

import LaravelValidator from '../core/LaravelValidator.js';

function getConfig() {
    return window.LaravelClientValidation?.config || {
        remoteUrl: '/client-validation/validate',
        debounce: 300,
        errorClass: 'text-red-500 text-sm mt-1',
        validClass: 'border-green-500',
        invalidClass: 'border-red-500',
    };
}

export class LivewireValidator {
    constructor(component, options = {}) {
        this.component = component;
        this.config = { ...getConfig(), ...options };
        this.validator = null;
        this.fields = new Map();
        this.errors = {};
        this.touched = new Set();
        this.eventListeners = [];

        if (options.rules) {
            this.init(options);
        }
    }

    init(options) {
        this.validator = new LaravelValidator({
            rules: options.rules || {},
            messages: options.messages || {},
            attributes: options.attributes || {},
            remoteUrl: this.config.remoteUrl,
            debounce: this.config.debounce,
        });

        this.validator.on('field:validated', ({ field, valid, errors }) => {
            this.errors[field] = errors;
            this.touched.add(field);
            this.syncErrorsToLivewire(field, errors);
        });
    }

    syncErrorsToLivewire(field, errors) {
        if (!this.component || !this.component.$wire) return;

        try {
            if (errors.length > 0) {
                this.component.$wire.dispatch('client-validation-error', {
                    field,
                    errors
                });
            } else {
                this.component.$wire.dispatch('client-validation-cleared', { field });
            }
        } catch (e) {
            // Livewire may not be ready
        }
    }

    async validateField(field, value, allData = {}) {
        if (!this.validator) return { valid: true, errors: [] };

        const data = this.getFormData(allData);
        const result = await this.validator.validateField(field, value, data);

        this.updateFieldUI(field, result);
        return result;
    }

    async validateFieldDebounced(field, value, allData = {}) {
        if (!this.validator) return { valid: true, errors: [] };

        const data = this.getFormData(allData);
        return this.validator.validateFieldDebounced(field, value, data);
    }

    async validateAll(data = {}) {
        if (!this.validator) return { valid: true, errors: {} };

        const formData = this.getFormData(data);
        const result = await this.validator.validateAll(formData);

        Object.entries(result.results).forEach(([field, fieldResult]) => {
            this.updateFieldUI(field, fieldResult);
        });

        return result;
    }

    getFormData(additionalData = {}) {
        const data = { ...additionalData };

        if (this.component && this.component.$wire) {
            try {
                const wireData = this.component.$wire.snapshot?.data || {};
                Object.assign(data, wireData);
            } catch (e) {
                // Use provided data only
            }
        }

        this.fields.forEach((el, name) => {
            if (el && el.value !== undefined) {
                data[name] = this.getFieldValue(el);
            }
        });

        return data;
    }

    getFieldValue(el) {
        if (el.type === 'checkbox') {
            return el.checked;
        }
        if (el.type === 'radio') {
            const form = el.closest('form');
            const checked = form?.querySelector(`input[name="${el.name}"]:checked`);
            return checked?.value || '';
        }
        if (el.tagName === 'SELECT' && el.multiple) {
            return Array.from(el.selectedOptions).map(o => o.value);
        }
        return el.value;
    }

    updateFieldUI(field, result) {
        const el = this.fields.get(field) || document.querySelector(`[name="${field}"]`);
        if (!el) return;

        const errorContainer = this.findErrorContainer(el, field);

        el.classList.remove(...this.config.validClass.split(' '));
        el.classList.remove(...this.config.invalidClass.split(' '));

        if (result.valid) {
            el.classList.add(...this.config.validClass.split(' '));
            if (errorContainer) errorContainer.textContent = '';
        } else {
            el.classList.add(...this.config.invalidClass.split(' '));
            if (errorContainer) {
                errorContainer.textContent = result.errors[0] || '';
            }
        }
    }

    findErrorContainer(el, field) {
        let container = el.parentElement?.querySelector(`[data-error="${field}"]`);
        if (!container) {
            container = el.parentElement?.querySelector('.validation-error');
        }
        if (!container) {
            container = el.nextElementSibling;
            if (container && !container.classList.contains('validation-error')) {
                container = null;
            }
        }
        return container;
    }

    registerField(name, element) {
        this.fields.set(name, element);
        return this;
    }

    hasError(field) {
        return (this.errors[field]?.length || 0) > 0;
    }

    getError(field) {
        return this.errors[field]?.[0] || null;
    }

    getErrors(field) {
        return this.errors[field] || [];
    }

    getAllErrors() {
        return { ...this.errors };
    }

    clearErrors(field = null) {
        if (field) {
            delete this.errors[field];
            this.touched.delete(field);
        } else {
            this.errors = {};
            this.touched.clear();
        }
        if (this.validator) {
            this.validator.clearErrors(field);
        }
    }

    isTouched(field) {
        return this.touched.has(field);
    }

    isValid(field) {
        return this.isTouched(field) && !this.hasError(field);
    }

    destroy() {
        this.eventListeners.forEach(({ el, event, handler }) => {
            el.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.fields.clear();
        this.errors = {};
        this.touched.clear();
    }
}

export function createLivewireValidator(component, options = {}) {
    return new LivewireValidator(component, options);
}

export function registerLivewireDirective(Alpine) {
    if (!Alpine) return;

    const config = getConfig();

    Alpine.directive('wire-validate', (el, { expression, modifiers }, { evaluate, effect, cleanup }) => {
        const fieldName = el.name || el.getAttribute('wire:model') || el.getAttribute('data-field');
        if (!fieldName) {
            console.warn('x-wire-validate: Element must have a name or wire:model attribute');
            return;
        }

        const mode = modifiers.includes('live') ? 'live'
            : modifiers.includes('blur') ? 'blur'
            : 'blur';

        let validator = null;
        let unsubscribers = [];

        effect(() => {
            const rules = evaluate(expression);
            if (!rules) return;

            validator = new LaravelValidator({
                rules: { [fieldName]: rules },
                ...config
            });

            el._validator = validator;
            el._fieldName = fieldName;

            unsubscribers = setupLivewireFieldHandlers(el, validator, fieldName, mode, config);
        });

        cleanup(() => {
            unsubscribers.forEach(fn => fn());
            if (validator) validator.destroy();
        });
    });
}

function setupLivewireFieldHandlers(el, validator, fieldName, mode, config) {
    const unsubscribers = [];

    const getFormData = () => {
        const form = el.closest('form');
        if (!form) return {};

        const data = {};
        form.querySelectorAll('[name]').forEach(field => {
            data[field.name] = getFieldValue(field);
        });
        return data;
    };

    const getFieldValue = (field) => {
        if (field.type === 'checkbox') return field.checked;
        if (field.type === 'radio') {
            const form = field.closest('form');
            const checked = form?.querySelector(`input[name="${field.name}"]:checked`);
            return checked?.value || '';
        }
        return field.value;
    };

    const updateUI = (result) => {
        const errorContainer = el.parentElement?.querySelector(`[data-error="${fieldName}"]`)
            || el.parentElement?.querySelector('.validation-error')
            || el.nextElementSibling;

        el.classList.remove(...config.validClass.split(' '));
        el.classList.remove(...config.invalidClass.split(' '));

        if (result.valid) {
            el.classList.add(...config.validClass.split(' '));
            if (errorContainer) errorContainer.textContent = '';
        } else {
            el.classList.add(...config.invalidClass.split(' '));
            if (errorContainer) {
                errorContainer.textContent = result.errors[0] || '';
            }
        }
    };

    const validate = async () => {
        const value = getFieldValue(el);
        const result = await validator.validateField(fieldName, value, getFormData());
        updateUI(result);

        if (window.Livewire && el.closest('[wire\\:id]')) {
            const component = window.Livewire.find(el.closest('[wire\\:id]').getAttribute('wire:id'));
            if (component) {
                component.dispatch('client-validation', {
                    field: fieldName,
                    valid: result.valid,
                    errors: result.errors
                });
            }
        }

        return result.valid;
    };

    const validateDebounced = debounce(validate, config.debounce);

    if (mode === 'live') {
        el.addEventListener('input', validateDebounced);
        unsubscribers.push(() => el.removeEventListener('input', validateDebounced));
    }

    el.addEventListener('blur', validate);
    unsubscribers.push(() => el.removeEventListener('blur', validate));

    el.validate = validate;

    return unsubscribers;
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export default {
    LivewireValidator,
    createLivewireValidator,
    registerLivewireDirective,
};
