/**
 * Alpine.js Adapter for Laravel Client Validation
 *
 * Provides seamless integration with Alpine.js through:
 * - x-validate directive for individual field validation
 * - Alpine.data('validation') for complete form handling
 * - Configurable validation triggers (blur, input, submit)
 *
 * @example Basic directive usage
 * <input x-validate="'required|email'" name="email">
 * <input x-validate.live="'required|min:3'" name="username">
 * <input x-validate.submit="'required'" name="password">
 *
 * @example Form component usage
 * <div x-data="validation({
 *     rules: { email: 'required|email', name: 'required|min:2' },
 *     messages: { 'email.required': 'Email is required' }
 * })">
 *     <input x-model="form.email" @blur="validate('email')">
 *     <span x-text="error('email')"></span>
 * </div>
 */

import LaravelValidator from '../core/LaravelValidator.js';

/**
 * Get global config from window
 */
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

    // ==================== x-validate Directive ====================
    // Usage: <input x-validate="'required|email'" name="email">
    // Modifiers: .blur (default), .live, .submit
    Alpine.directive('validate', (el, { expression, modifiers }, { evaluate, effect, cleanup }) => {
        const fieldName = el.name || el.getAttribute('data-field');
        if (!fieldName) {
            console.warn('x-validate: Element must have a name attribute');
            return;
        }

        // Determine validation mode
        const mode = modifiers.includes('live') ? 'live'
            : modifiers.includes('submit') ? 'submit'
            : 'blur';

        let validator = null;
        let unsubscribers = [];

        // Create validator when rules are available
        effect(() => {
            const rules = evaluate(expression);
            if (!rules) return;

            // Create validator for this field
            validator = new LaravelValidator({
                rules: { [fieldName]: rules },
                ...config
            });

            // Store reference on element
            el._validator = validator;
            el._fieldName = fieldName;

            // Setup validation handlers
            unsubscribers = setupFieldHandlers(el, validator, fieldName, mode, config);
        });

        cleanup(() => {
            unsubscribers.forEach(fn => fn());
            if (validator) validator.destroy();
        });
    });

    // ==================== validation() Alpine Data Component ====================
    // Full form validation with reactive state
    Alpine.data('validation', (options = {}) => ({
        // Form data - initialized from rules
        form: {},

        // Internal validator instance
        _validator: null,

        // Reactive state
        errors: {},
        touched: {},
        validating: false,

        init() {
            const rules = options.rules || {};
            const messages = options.messages || {};
            const attributes = options.attributes || {};

            // Initialize form data with empty values
            this.form = Object.keys(rules).reduce((acc, field) => {
                acc[field] = options.initialData?.[field] ?? '';
                return acc;
            }, {});

            // Create validator
            this._validator = new LaravelValidator({
                rules,
                messages,
                attributes,
                ...config,
                ...options.config
            });

            // Setup event hooks
            this._validator.afterFieldValidate(({ field, valid, errors }) => {
                this.touched[field] = true;
                if (valid) {
                    delete this.errors[field];
                } else {
                    this.errors[field] = errors;
                }
            });
        },

        // ==================== Validation Methods ====================

        /**
         * Validate a single field
         * @param {string} field - Field name to validate
         */
        async validate(field) {
            if (!this._validator) return true;

            const result = await this._validator.validateField(field, this.form[field], this.form);
            return result.valid;
        },

        /**
         * Validate field with debounce (for live validation)
         */
        async validateLive(field) {
            if (!this._validator) return true;

            const result = await this._validator.validateFieldDebounced(field, this.form[field], this.form);
            return result.valid;
        },

        /**
         * Validate all form fields
         */
        async validateAll() {
            if (!this._validator) return true;

            this.validating = true;
            const result = await this._validator.validateAll(this.form);
            this.validating = false;

            // Update errors
            this.errors = { ...result.errors };

            return result.valid;
        },

        /**
         * Submit handler - validates then calls callback if valid
         * Usage: @submit.prevent="submit(async (data) => { ... })"
         */
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

        // ==================== Error Helpers ====================

        /**
         * Get first error for a field
         */
        error(field) {
            return this.errors[field]?.[0] || '';
        },

        /**
         * Get all errors for a field
         */
        errorList(field) {
            return this.errors[field] || [];
        },

        /**
         * Check if field has error
         */
        hasError(field) {
            return !!this.errors[field]?.length;
        },

        /**
         * Check if any field has errors
         */
        hasErrors() {
            return Object.keys(this.errors).length > 0;
        },

        /**
         * Clear error for a field or all fields
         */
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

        // ==================== State Helpers ====================

        /**
         * Check if field has been touched
         */
        isTouched(field) {
            return !!this.touched[field];
        },

        /**
         * Check if field is valid (touched and no errors)
         */
        isValid(field = null) {
            if (field) {
                return this.touched[field] && !this.hasError(field);
            }
            // Check if all required fields are valid
            return !this.hasErrors() && Object.keys(this.touched).length > 0;
        },

        /**
         * Get CSS class based on validation state
         */
        stateClass(field, validClass = '', invalidClass = '') {
            if (!this.touched[field]) return '';
            return this.hasError(field) ? (invalidClass || config.invalidClass) : (validClass || config.validClass);
        },

        /**
         * Reset form to initial state
         */
        reset() {
            const rules = options.rules || {};
            this.form = Object.keys(rules).reduce((acc, field) => {
                acc[field] = options.initialData?.[field] ?? '';
                return acc;
            }, {});
            this.clearError();
            this._validator?.reset();
        },

        /**
         * Destroy validator
         */
        destroy() {
            this._validator?.destroy();
        }
    }));

    // ==================== Magic Properties ====================
    // $validation magic for accessing validation in any component
    Alpine.magic('validation', (el) => {
        // Find closest validation data
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

/**
 * Setup event handlers for field validation
 */
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

    // Store validate function on element for programmatic validation
    el.validate = validateField;

    return unsubscribers;
}

/**
 * Get field value based on input type
 */
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

/**
 * Update field UI based on validation result
 */
function updateFieldUI(el, result, config) {
    // Remove existing error element
    const existingError = el.parentNode.querySelector(`[data-error-for="${el.name}"]`);
    if (existingError) {
        existingError.remove();
    }

    // Update field classes
    el.classList.remove(config.validClass, config.invalidClass);

    if (result.valid) {
        el.classList.add(config.validClass);
    } else {
        el.classList.add(config.invalidClass);

        // Create error element
        if (result.errors.length > 0 && config.showErrors !== false) {
            const errorEl = document.createElement('div');
            errorEl.setAttribute('data-error-for', el.name);
            errorEl.className = config.errorClass;
            errorEl.textContent = result.errors[0];
            el.parentNode.insertBefore(errorEl, el.nextSibling);
        }
    }

    // Dispatch custom event
    el.dispatchEvent(new CustomEvent('validated', {
        detail: result,
        bubbles: true
    }));
}
