import ClientValidator from '../core/validator.js';

/**
 * Alpine.js integration with better directive support and form handling
 */
export default function alpineIntegration(Alpine) {
    // Main validation directive
    Alpine.directive('validate', (el, { expression, modifiers }, { evaluateLater, effect, cleanup }) => {
        const getRule = evaluateLater(expression);
        let validator = null;
        let fieldName = el.name || el.getAttribute('name') || el.getAttribute('data-field') || 'field';
        let validationMode = getValidationMode(modifiers);

        effect(() => {
            getRule(rule => {
                if (rule) {
                    validator = createValidator(fieldName, rule);
                    setupFieldValidation(el, validator, fieldName, validationMode);
                }
            });
        });

        cleanup(() => {
            if (validator) {
                validator.destroy();
            }
            cleanupFieldValidation(el);
        });
    });

    // Form validation directive
    Alpine.directive('validate-form', (el, { expression }, { evaluateLater, effect, cleanup }) => {
        const getConfig = evaluateLater(expression);
        let formValidator = null;

        effect(() => {
            getConfig(config => {
                if (config) {
                    formValidator = createFormValidator(el, config);
                    setupFormValidation(el, formValidator, config);
                }
            });
        });

        cleanup(() => {
            if (formValidator) {
                formValidator.destroy();
            }
            cleanupFormValidation(el);
        });
    });

    // Alpine data component for forms
    Alpine.data('validateForm', (rules = {}, messages = {}, attributes = {}, options = {}) => {
        return {
            // Form data
            form: createFormProxy(rules),

            // Validation state
            errors: {},
            validating: false,
            validator: null,

            // Initialize
            init() {
                this.validator = new ClientValidator(rules, messages, attributes, {
                    ...getGlobalConfig(),
                    ...options
                });

                this.setupValidationHooks();
                this.validator.clearErrors();
            },

            // Validation methods
            async validate(field = null) {
                if (field) {
                    return await this.validateField(field);
                }
                return await this.validateForm();
            },

            async validateField(field) {
                const value = this.form[field];
                const result = await this.validator.validateField(field, value);
                this.updateFieldState(field, result);
                return result.valid;
            },

            async validateForm() {
                this.validating = true;
                const result = await this.validator.validate(this.form);
                this.validating = false;
                this.updateFormState(result.results);
                return result.valid;
            },

            // Submit handling
            async submitForm(submitCallback = null) {
                const isValid = await this.validateForm();

                if (isValid && submitCallback) {
                    try {
                        await submitCallback(this.form);
                    } catch (error) {
                        console.error('Form submission error:', error);
                    }
                }

                return isValid;
            },

            // Error management
            hasError(field) {
                return this.validator.hasError(field);
            },

            getError(field) {
                return this.validator.getFirstFieldError(field);
            },

            getErrors(field) {
                return this.validator.getFieldErrors(field);
            },

            clearError(field) {
                this.validator.clearErrors(field);
                this.updateFieldState(field, { valid: true, errors: [] });
            },

            clearErrors() {
                this.validator.clearErrors();
                this.errors = {};
            },

            // Form state
            isValid() {
                return this.validator.isValid();
            },

            hasAnyErrors() {
                return this.validator.hasAnyErrors();
            },

            isFieldValid(field) {
                return this.validator.isFieldValid(field);
            },

            // Utilities
            updateFieldState(field, result) {
                if (result.valid) {
                    delete this.errors[field];
                } else {
                    this.errors[field] = result.errors;
                }
            },

            updateFormState(results) {
                this.errors = {};
                for (const [field, result] of Object.entries(results)) {
                    if (!result.valid) {
                        this.errors[field] = result.errors;
                    }
                }
            },

            setupValidationHooks() {
                this.validator
                    .beforeValidate((context) => {
                        this.validating = true;
                        this.$dispatch('validation:start', context);
                    })
                    .afterValidate((context) => {
                        this.validating = false;
                        this.$dispatch('validation:complete', context);
                    })
                    .onPasses((context) => {
                        this.$dispatch('validation:passes', context);
                    })
                    .onFails((context) => {
                        this.$dispatch('validation:fails', context);
                    });
            },

            // Lifecycle
            destroy() {
                if (this.validator) {
                    this.validator.destroy();
                }
            }
        };
    });

    // Utility functions
    function getValidationMode(modifiers) {
        if (modifiers.includes('live') || modifiers.includes('input')) return 'live';
        if (modifiers.includes('form') || modifiers.includes('submit')) return 'form';
        if (modifiers.includes('blur')) return 'blur';
        return 'blur'; // default
    }

    function createValidator(fieldName, rule) {
        const rules = { [fieldName]: rule };
        return new ClientValidator(rules, {}, {}, getGlobalConfig());
    }

    function createFormValidator(formEl, config) {
        return new ClientValidator(
            config.rules || {},
            config.messages || {},
            config.attributes || {},
            { ...getGlobalConfig(), ...config.options }
        );
    }

    function setupFieldValidation(el, validator, fieldName, mode) {
        const validateField = async () => {
            const value = getFieldValue(el);
            const result = await validator.validateField(fieldName, value);
            updateFieldUI(el, fieldName, result);
            return result.valid;
        };

        switch (mode) {
            case 'live':
                setupLiveValidation(el, validateField);
                break;
            case 'form':
                setupFormSubmitValidation(el, validateField);
                break;
            case 'blur':
            default:
                setupBlurValidation(el, validateField);
                break;
        }

        // Store validator and cleanup function
        el._validator = validator;
        el._validateField = validateField;
    }

    function setupFormValidation(formEl, validator, config) {
        const validateForm = async () => {
            const formData = collectFormData(formEl);
            const result = await validator.validate(formData);
            updateFormUI(formEl, result);
            return result.valid;
        };

        // Submit validation
        const submitHandler = async (e) => {
            e.preventDefault();
            const isValid = await validateForm();

            if (isValid && config.onSubmit) {
                config.onSubmit(collectFormData(formEl));
            }
        };

        formEl.addEventListener('submit', submitHandler);
        formEl._formValidator = validator;
        formEl._submitHandler = submitHandler;
    }

    function setupLiveValidation(el, validateField) {
        const handler = debounce(validateField, getGlobalConfig().debounceMs || 300);
        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
        el._liveValidationHandler = handler;
    }

    function setupBlurValidation(el, validateField) {
        el.addEventListener('blur', validateField);
        el._blurValidationHandler = validateField;
    }

    function setupFormSubmitValidation(el, validateField) {
        const form = el.closest('form');
        if (form) {
            const submitHandler = async (e) => {
                if (!(await validateField())) {
                    e.preventDefault();
                    return false;
                }
            };
            form.addEventListener('submit', submitHandler);
            el._formSubmitHandler = submitHandler;
        }
    }

    function updateFieldUI(el, fieldName, result) {
        const config = getGlobalConfig();

        // Update field styling
        updateFieldStyling(el, result.valid, config.fieldStyling);

        // Update error display
        if (result.valid) {
            hideFieldError(fieldName);
        } else {
            displayFieldError(fieldName, result.errors, config.errorTemplate);
        }

        // Dispatch events
        el.dispatchEvent(new CustomEvent('field:validated', {
            detail: { field: fieldName, result },
            bubbles: true
        }));
    }

    function updateFormUI(formEl, result) {
        // Update individual fields
        for (const [field, fieldResult] of Object.entries(result.results)) {
            const fieldEl = formEl.querySelector(`[name="${field}"]`);
            if (fieldEl) {
                updateFieldUI(fieldEl, field, fieldResult);
            }
        }

        // Dispatch form event
        formEl.dispatchEvent(new CustomEvent('form:validated', {
            detail: { result },
            bubbles: true
        }));
    }

    function cleanupFieldValidation(el) {
        if (el._liveValidationHandler) {
            el.removeEventListener('input', el._liveValidationHandler);
            el.removeEventListener('change', el._liveValidationHandler);
        }
        if (el._blurValidationHandler) {
            el.removeEventListener('blur', el._blurValidationHandler);
        }
        if (el._formSubmitHandler) {
            const form = el.closest('form');
            if (form) {
                form.removeEventListener('submit', el._formSubmitHandler);
            }
        }
    }

    function cleanupFormValidation(el) {
        if (el._submitHandler) {
            el.removeEventListener('submit', el._submitHandler);
        }
    }

    // Utility functions
    function getFieldValue(el) {
        if (el.type === 'checkbox') {
            return el.checked ? (el.value || '1') : '';
        }
        if (el.type === 'radio') {
            const form = el.closest('form');
            const checked = form?.querySelector(`input[name="${el.name}"]:checked`);
            return checked ? checked.value : '';
        }
        return el.value || '';
    }

    function collectFormData(formEl) {
        const formData = new FormData(formEl);
        const data = {};

        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (like checkboxes)
                data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    function createFormProxy(rules) {
        const data = {};

        // Initialize form data with empty values
        Object.keys(rules).forEach(field => {
            data[field] = '';
        });

        return new Proxy(data, {
            set(target, property, value) {
                target[property] = value;
                return true;
            },
            get(target, property) {
                return target[property];
            }
        });
    }

    function updateFieldStyling(el, isValid, config = {}) {
        if (!config.enabled) return;

        const removeClasses = config.removeClasses || [];
        const validClass = config.validClass || 'is-valid';
        const invalidClass = config.invalidClass || 'is-invalid';

        el.classList.remove(...removeClasses);

        if (isValid) {
            el.classList.add(...validClass.split(' '));
        } else {
            el.classList.add(...invalidClass.split(' '));
        }
    }

    function displayFieldError(field, errors, config = {}) {
        // This would integrate with the ErrorManager
        console.log(`Field ${field} has errors:`, errors);
    }

    function hideFieldError(field) {
        // This would integrate with the ErrorManager
        console.log(`Hiding error for field: ${field}`);
    }

    function getGlobalConfig() {
        return window.clientValidationConfig || {
            ajaxUrl: '/client-validation/validate',
            enableAjax: true,
            debounceMs: 300,
            fieldStyling: { enabled: true },
            errorTemplate: { enabled: true }
        };
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
