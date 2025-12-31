/**
 * Vue Adapter for Laravel Client Validation
 * Provides composables and directives for Vue 3 applications.
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
 * Vue 3 Composable for form validation
 * @param {Object} options - Validation options
 * @returns {Object} - Reactive validation state and methods
 */
export function useValidation(options = {}) {
    const config = { ...getConfig(), ...options };

    const state = {
        errors: {},
        touched: new Set(),
        validating: false,
    };

    let validator = null;

    const init = () => {
        if (!validator && options.rules) {
            validator = new LaravelValidator({
                rules: options.rules,
                messages: options.messages || {},
                attributes: options.attributes || {},
                remoteUrl: config.remoteUrl,
                debounce: config.debounce,
            });
        }
        return validator;
    };

    const validateField = async (field, value, allData = {}) => {
        init();
        if (!validator) return { valid: true, errors: [] };

        state.touched.add(field);
        state.validating = true;

        try {
            const result = await validator.validateField(field, value, allData);
            state.errors[field] = result.errors;
            return result;
        } finally {
            state.validating = false;
        }
    };

    const validateAll = async (data = {}) => {
        init();
        if (!validator) return { valid: true, errors: {} };

        state.validating = true;

        try {
            const result = await validator.validateAll(data);
            Object.entries(result.results).forEach(([field, fieldResult]) => {
                state.touched.add(field);
                state.errors[field] = fieldResult.errors;
            });
            return result;
        } finally {
            state.validating = false;
        }
    };

    const hasError = (field) => (state.errors[field]?.length || 0) > 0;
    const getError = (field) => state.errors[field]?.[0] || null;
    const getErrors = (field) => state.errors[field] || [];
    const getAllErrors = () => ({ ...state.errors });

    const clearErrors = (field = null) => {
        if (field) {
            delete state.errors[field];
            state.touched.delete(field);
        } else {
            state.errors = {};
            state.touched.clear();
        }
        if (validator) validator.clearErrors(field);
    };

    const isTouched = (field) => state.touched.has(field);
    const isValid = (field) => isTouched(field) && !hasError(field);
    const hasErrors = () => Object.values(state.errors).some(e => e.length > 0);

    const reset = () => {
        clearErrors();
        if (validator) validator.clearErrors();
    };

    const destroy = () => {
        if (validator) validator.destroy();
    };

    if (options.rules) {
        init();
    }

    return {
        // State
        errors: state.errors,
        validating: state.validating,

        // Methods
        init,
        validateField,
        validateAll,
        hasError,
        getError,
        getErrors,
        getAllErrors,
        clearErrors,
        isTouched,
        isValid,
        hasErrors,
        reset,
        destroy,
    };
}

/**
 * Create a validator instance for use outside Vue
 */
export function createVueValidator(options = {}) {
    return useValidation(options);
}

/**
 * Vue 3 Directive for field validation
 * Usage: v-validate="'required|email'" or v-validate.live="'required|min:3'"
 */
export const vValidate = {
    mounted(el, binding, vnode) {
        const config = getConfig();
        const rules = binding.value;
        const fieldName = el.name || el.getAttribute('data-field');

        if (!fieldName || !rules) {
            console.warn('v-validate: Element must have a name attribute and rules');
            return;
        }

        const isLive = binding.modifiers.live;

        const validator = new LaravelValidator({
            rules: { [fieldName]: rules },
            ...config
        });

        el._validator = validator;
        el._fieldName = fieldName;

        const getFormData = () => {
            const form = el.closest('form');
            if (!form) return {};

            const data = {};
            form.querySelectorAll('[name]').forEach(field => {
                if (field.type === 'checkbox') {
                    data[field.name] = field.checked;
                } else if (field.type === 'radio') {
                    const checked = form.querySelector(`input[name="${field.name}"]:checked`);
                    data[field.name] = checked?.value || '';
                } else {
                    data[field.name] = field.value;
                }
            });
            return data;
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
            const value = el.type === 'checkbox' ? el.checked : el.value;
            const result = await validator.validateField(fieldName, value, getFormData());
            updateUI(result);
            return result.valid;
        };

        let debounceTimer;
        const validateDebounced = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(validate, config.debounce);
        };

        if (isLive) {
            el.addEventListener('input', validateDebounced);
        }
        el.addEventListener('blur', validate);

        el.validate = validate;

        el._cleanup = () => {
            el.removeEventListener('input', validateDebounced);
            el.removeEventListener('blur', validate);
            validator.destroy();
        };
    },

    unmounted(el) {
        el._cleanup?.();
    }
};

/**
 * Vue Plugin
 */
export const VueValidationPlugin = {
    install(app, options = {}) {
        const config = { ...getConfig(), ...options };

        // Register global directive
        app.directive('validate', vValidate);

        // Provide validation config
        app.provide('validationConfig', config);

        // Add global method
        app.config.globalProperties.$validation = {
            create: (opts) => useValidation({ ...config, ...opts }),
        };
    }
};

/**
 * Validation mixin for Options API
 */
export const ValidationMixin = {
    data() {
        return {
            validation: {
                errors: {},
                touched: new Set(),
                validating: false,
            }
        };
    },

    methods: {
        initValidation(options = {}) {
            this._validator = new LaravelValidator({
                rules: options.rules || this.$options.validationRules || {},
                messages: options.messages || this.$options.validationMessages || {},
                attributes: options.attributes || {},
                ...getConfig(),
            });
        },

        async validateField(field, value, allData = {}) {
            if (!this._validator) this.initValidation();

            this.validation.touched.add(field);
            this.validation.validating = true;

            try {
                const result = await this._validator.validateField(field, value, allData || this.getFormData());
                this.$set ? this.$set(this.validation.errors, field, result.errors) : (this.validation.errors[field] = result.errors);
                return result;
            } finally {
                this.validation.validating = false;
            }
        },

        async validateAll(data = {}) {
            if (!this._validator) this.initValidation();

            this.validation.validating = true;

            try {
                const result = await this._validator.validateAll(data || this.getFormData());
                Object.entries(result.results).forEach(([field, fieldResult]) => {
                    this.validation.touched.add(field);
                    if (this.$set) {
                        this.$set(this.validation.errors, field, fieldResult.errors);
                    } else {
                        this.validation.errors[field] = fieldResult.errors;
                    }
                });
                return result;
            } finally {
                this.validation.validating = false;
            }
        },

        hasError(field) {
            return (this.validation.errors[field]?.length || 0) > 0;
        },

        getError(field) {
            return this.validation.errors[field]?.[0] || null;
        },

        clearErrors(field = null) {
            if (field) {
                delete this.validation.errors[field];
                this.validation.touched.delete(field);
            } else {
                this.validation.errors = {};
                this.validation.touched.clear();
            }
            if (this._validator) this._validator.clearErrors(field);
        },

        getFormData() {
            // Override in component to provide form data
            return {};
        }
    },

    beforeUnmount() {
        if (this._validator) {
            this._validator.destroy();
        }
    }
};

export default {
    useValidation,
    createVueValidator,
    vValidate,
    VueValidationPlugin,
    ValidationMixin,
};
