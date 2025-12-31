/**
 * Alpine.js Adapter for Laravel Client Validation
 * Provides x-validate directive and validation() data component.
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

/**
 * Register Alpine.js integration
 */
export default function registerAlpine(Alpine) {
    const config = getConfig();

    // x-validate Directive: <input x-validate="'required|email'" name="email">
    // Modifiers: .blur (default), .live, .submit
    Alpine.directive('validate', (el, { expression, modifiers }, { evaluate, effect, cleanup }) => {
        const fieldName = el.name || el.getAttribute('data-field');
        if (!fieldName) {
            console.warn('x-validate: Element must have a name attribute');
            return;
        }

        const mode = modifiers.includes('live') ? 'live'
            : modifiers.includes('submit') ? 'submit'
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

            unsubscribers = setupFieldHandlers(el, validator, fieldName, mode, config);
        });

        cleanup(() => {
            unsubscribers.forEach(fn => fn());
            if (validator) validator.destroy();
        });
    });

    // validation() Alpine Data Component - full form validation with reactive state
    Alpine.data('validation', (options = {}) => ({
        form: {},
        _validator: null,
        errors: {},
        touched: {},
        validating: false,

        init() {
            const rules = options.rules || {};
            const messages = options.messages || {};
            const attributes = options.attributes || {};

            this.form = Object.keys(rules).reduce((acc, field) => {
                acc[field] = options.initialData?.[field] ?? '';
                return acc;
            }, {});

            this._validator = new LaravelValidator({
                rules,
                messages,
                attributes,
                ...config,
                ...options.config
            });

            this._validator.afterFieldValidate(({ field, valid, errors }) => {
                this.touched[field] = true;
                if (valid) {
                    delete this.errors[field];
                } else {
                    this.errors[field] = errors;
                }
            });
        },

        async validate(field) {
            if (!this._validator) return true;
            const result = await this._validator.validateField(field, this.form[field], this.form);
            return result.valid;
        },

        async validateLive(field) {
            if (!this._validator) return true;
            const result = await this._validator.validateFieldDebounced(field, this.form[field], this.form);
            return result.valid;
        },

        async validateAll() {
            if (!this._validator) return true;
            this.validating = true;
            const result = await this._validator.validateAll(this.form);
            this.validating = false;
            this.errors = { ...result.errors };
            return result.valid;
        },

        async submit(callback) {
            const isValid = await this.validateAll();
            if (isValid && callback) {
                try {
                    await callback(this.form);
                } catch (err) {
                    console.error('Form submission error:', err);
                }
            }
            return isValid;
        },

        error(field) {
            return this.errors[field]?.[0] || '';
        },

        errorList(field) {
            return this.errors[field] || [];
        },

        hasError(field) {
            return !!this.errors[field]?.length;
        },

        hasErrors() {
            return Object.keys(this.errors).length > 0;
        },

        clearError(field = null) {
            if (field) {
                delete this.errors[field];
                delete this.touched[field];
            } else {
                this.errors = {};
                this.touched = {};
            }
            this._validator?.clearErrors(field);
        },

        isTouched(field) {
            return !!this.touched[field];
        },

        isValid(field = null) {
            if (field) {
                return this.touched[field] && !this.hasError(field);
            }
            return !this.hasErrors() && Object.keys(this.touched).length > 0;
        },

        stateClass(field, validClass = '', invalidClass = '') {
            if (!this.touched[field]) return '';
            return this.hasError(field) ? (invalidClass || config.invalidClass) : (validClass || config.validClass);
        },

        reset() {
            const rules = options.rules || {};
            this.form = Object.keys(rules).reduce((acc, field) => {
                acc[field] = options.initialData?.[field] ?? '';
                return acc;
            }, {});
            this.clearError();
            this._validator?.reset();
        },

        destroy() {
            this._validator?.destroy();
        }
    }));

    // $validation magic for accessing validation in any component
    Alpine.magic('validation', (el) => {
        let current = el;
        while (current) {
            if (current._x_dataStack) {
                for (const data of current._x_dataStack) {
                    if (data._validator) {
                        return data;
                    }
                }
            }
            current = current.parentElement;
        }
        return null;
    });
}

function setupFieldHandlers(el, validator, fieldName, mode, config) {
    const unsubscribers = [];

    const validateField = async () => {
        const value = getFieldValue(el);
        const result = await validator.validateField(fieldName, value);
        updateFieldUI(el, result, config);
        return result.valid;
    };

    const validateFieldDebounced = async () => {
        const value = getFieldValue(el);
        const result = await validator.validateFieldDebounced(fieldName, value);
        updateFieldUI(el, result, config);
        return result.valid;
    };

    switch (mode) {
        case 'live':
            el.addEventListener('input', validateFieldDebounced);
            el.addEventListener('blur', validateField);
            unsubscribers.push(() => {
                el.removeEventListener('input', validateFieldDebounced);
                el.removeEventListener('blur', validateField);
            });
            break;

        case 'submit':
            const form = el.closest('form');
            if (form) {
                const submitHandler = async (e) => {
                    if (!(await validateField())) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                };
                form.addEventListener('submit', submitHandler, true);
                unsubscribers.push(() => form.removeEventListener('submit', submitHandler, true));
            }
            break;

        case 'blur':
        default:
            el.addEventListener('blur', validateField);
            unsubscribers.push(() => el.removeEventListener('blur', validateField));
            break;
    }

    el.validate = validateField;

    return unsubscribers;
}

function getFieldValue(el) {
    if (el.type === 'checkbox') {
        return el.checked ? (el.value || true) : false;
    }
    if (el.type === 'radio') {
        const form = el.closest('form') || document;
        const checked = form.querySelector(`input[name="${el.name}"]:checked`);
        return checked ? checked.value : '';
    }
    if (el.type === 'file') {
        return el.files;
    }
    return el.value;
}

function updateFieldUI(el, result, config) {
    const existingError = el.parentNode.querySelector(`[data-error-for="${el.name}"]`);
    if (existingError) {
        existingError.remove();
    }

    el.classList.remove(config.validClass, config.invalidClass);

    if (result.valid) {
        el.classList.add(config.validClass);
    } else {
        el.classList.add(config.invalidClass);

        if (result.errors.length > 0 && config.showErrors !== false) {
            const errorEl = document.createElement('div');
            errorEl.setAttribute('data-error-for', el.name);
            errorEl.className = config.errorClass;
            errorEl.textContent = result.errors[0];
            el.parentNode.insertBefore(errorEl, el.nextSibling);
        }
    }

    el.dispatchEvent(new CustomEvent('validated', { detail: result, bubbles: true }));
}
