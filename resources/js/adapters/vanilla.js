/**
 * Vanilla JS Adapter for Laravel Client Validation
 * Uses data-* attributes - no framework required.
 */

import LaravelValidator from '../core/LaravelValidator.js';

function getConfig() {
    return window.LaravelClientValidation?.config || {
        remoteUrl: '/client-validation/validate',
        debounce: 300,
        errorClass: 'validation-error text-red-500 text-sm mt-1',
        validClass: 'is-valid border-green-500',
        invalidClass: 'is-invalid border-red-500',
    };
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export class VanillaFormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.config = { ...getConfig(), ...options };
        this.fields = new Map();
        this.validator = null;
        this.eventListeners = [];
        this.init();
    }

    init() {
        const rules = {};
        const messages = {};
        const attributes = {};

        this.form.querySelectorAll('[data-rules]').forEach(el => {
            const name = el.name;
            if (!name) {
                console.warn('data-rules: Element must have a name attribute', el);
                return;
            }

            rules[name] = el.dataset.rules;

            if (el.dataset.message) {
                const ruleName = el.dataset.rules.split('|')[0].split(':')[0];
                messages[`${name}.${ruleName}`] = el.dataset.message;
            }

            if (el.dataset.attribute) {
                attributes[name] = el.dataset.attribute;
            }

            this.fields.set(name, el);
        });

        this.validator = new LaravelValidator({
            rules,
            messages,
            attributes,
            remoteUrl: this.config.remoteUrl,
            debounce: this.config.debounce
        });

        this.setupFieldHandlers();
        this.setupFormHandler();
    }

    setupFieldHandlers() {
        this.fields.forEach((el, name) => {
            const mode = el.dataset.validateOn || 'blur';

            const validateField = async () => {
                const value = this.getFieldValue(el);
                const result = await this.validator.validateField(name, value, this.getFormData());
                this.updateFieldUI(el, result);
                return result.valid;
            };

            const validateDebounced = debounce(validateField, this.config.debounce);

            switch (mode) {
                case 'input':
                case 'live':
                    el.addEventListener('input', validateDebounced);
                    el.addEventListener('blur', validateField);
                    this.eventListeners.push(
                        { el, event: 'input', handler: validateDebounced },
                        { el, event: 'blur', handler: validateField }
                    );
                    break;

                case 'submit':
                    break;

                case 'blur':
                default:
                    el.addEventListener('blur', validateField);
                    this.eventListeners.push({ el, event: 'blur', handler: validateField });
                    break;
            }

            el.validate = validateField;
        });
    }

    setupFormHandler() {
        const submitHandler = async (e) => {
            e.preventDefault();
            const isValid = await this.validateAll();

            if (isValid) {
                this.form.removeEventListener('submit', submitHandler);
                if (this.config.onSubmit) {
                    this.config.onSubmit(this.getFormData(), this.form);
                } else {
                    this.form.submit();
                }
            }
        };

        this.form.addEventListener('submit', submitHandler);
        this.eventListeners.push({ el: this.form, event: 'submit', handler: submitHandler });
    }

    async validateAll() {
        const data = this.getFormData();
        const result = await this.validator.validateAll(data);

        this.fields.forEach((el, name) => {
            const fieldResult = result.results[name] || { valid: true, errors: [] };
            this.updateFieldUI(el, fieldResult);
        });

        return result.valid;
    }

    async validateField(name) {
        const el = this.fields.get(name);
        if (!el) return true;

        const value = this.getFieldValue(el);
        const result = await this.validator.validateField(name, value, this.getFormData());
        this.updateFieldUI(el, result);
        return result.valid;
    }

    getFormData() {
        const data = {};
        this.fields.forEach((el, name) => {
            data[name] = this.getFieldValue(el);
        });
        return data;
    }

    getFieldValue(el) {
        if (el.type === 'checkbox') return el.checked ? (el.value || true) : false;
        if (el.type === 'radio') {
            const checked = this.form.querySelector(`input[name="${el.name}"]:checked`);
            return checked ? checked.value : '';
        }
        if (el.type === 'file') return el.files;
        return el.value;
    }

    updateFieldUI(el, result) {
        const existingError = el.parentNode.querySelector(`[data-error-for="${el.name}"]`);
        if (existingError) existingError.remove();

        const validClasses = this.config.validClass.split(' ').filter(Boolean);
        const invalidClasses = this.config.invalidClass.split(' ').filter(Boolean);

        el.classList.remove(...validClasses, ...invalidClasses);

        if (result.valid) {
            el.classList.add(...validClasses);
        } else {
            el.classList.add(...invalidClasses);

            if (result.errors.length > 0) {
                const errorEl = document.createElement('div');
                errorEl.setAttribute('data-error-for', el.name);
                errorEl.className = this.config.errorClass;
                errorEl.textContent = result.errors[0];
                el.parentNode.insertBefore(errorEl, el.nextSibling);
            }
        }

        el.dispatchEvent(new CustomEvent('validated', { detail: result, bubbles: true }));
    }

    clearErrors(field = null) {
        if (field) {
            const el = this.fields.get(field);
            if (el) {
                const error = el.parentNode.querySelector(`[data-error-for="${field}"]`);
                if (error) error.remove();
                el.classList.remove(...this.config.validClass.split(' '), ...this.config.invalidClass.split(' '));
            }
        } else {
            this.form.querySelectorAll('[data-error-for]').forEach(el => el.remove());
            this.fields.forEach(el => {
                el.classList.remove(...this.config.validClass.split(' '), ...this.config.invalidClass.split(' '));
            });
        }
        this.validator.clearErrors(field);
    }

    getErrors() {
        return this.validator.errors;
    }

    hasErrors() {
        return this.validator.hasErrors();
    }

    destroy() {
        this.eventListeners.forEach(({ el, event, handler }) => {
            el.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.validator.destroy();
    }
}

export function initForms(selector = 'form[data-validate]') {
    const forms = document.querySelectorAll(selector);
    const validators = [];
    forms.forEach(form => validators.push(new VanillaFormValidator(form)));
    return validators;
}

export function createFormValidator(form, options = {}) {
    return new VanillaFormValidator(form, options);
}

export function autoInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initForms());
    } else {
        initForms();
    }
}

export default { VanillaFormValidator, initForms, createFormValidator, autoInit };
