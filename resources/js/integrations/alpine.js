import Validator from '../core/validator.js';

export default function (Alpine) {
    Alpine.directive('validate', (el, { expression, modifiers }, { evaluateLater, effect, cleanup }) => {
        const getRule = evaluateLater(expression);
        let validator = null;
        let fieldName = el.name || el.getAttribute('name') || 'field';

        effect(() => {
            getRule(rule => {
                if (rule) {
                    const options = {
                        ajaxUrl: window.clientValidationConfig?.ajaxUrl || '/client-validation/validate',
                        enableAjax: window.clientValidationConfig?.enableAjax !== false,
                        ...window.clientValidationConfig?.options || {}
                    };
                    validator = new Validator({ [fieldName]: rule }, {}, {}, options);
                    setupValidation(el, validator, fieldName, modifiers);
                }
            });
        });

        cleanup(() => {
            if (el._validateCleanup) {
                el._validateCleanup.forEach(fn => fn());
            }
        });
    });

    function setupValidation(el, validator, fieldName, modifiers) {
        const validateField = async () => {
            const value = el.value;
            const isValid = await validator.validateField(fieldName, value);
            updateFieldValidation(el, validator, fieldName, isValid);
            return isValid;
        };

        if (modifiers.includes('live')) {
            const handler = () => validateField();
            el.addEventListener('input', handler);
            el.addEventListener('change', handler);
            el._validateCleanup = [
                () => el.removeEventListener('input', handler),
                () => el.removeEventListener('change', handler)
            ];
        } else if (modifiers.includes('form')) {
            const form = el.closest('form');
            if (form) {
                const submitHandler = async (e) => {
                    if (!(await validateField())) {
                        e.preventDefault();
                        return false;
                    }
                };
                form.addEventListener('submit', submitHandler);
                el._validateCleanup = [() => form.removeEventListener('submit', submitHandler)];
            }
        } else {
            el.validate = validateField;
        }
    }

    function updateFieldValidation(el, validator, fieldName, isValid) {
        const config = window.clientValidationConfig || {};
        const fieldConfig = config.fieldStyling || {};
        const errorConfig = config.errorTemplate || {};

        // Update field styling
        if (fieldConfig.enabled !== false) {
            const removeClasses = fieldConfig.removeClasses || ['is-valid', 'is-invalid'];
            const validClass = fieldConfig.validClass || 'is-valid';
            const invalidClass = fieldConfig.invalidClass || 'is-invalid';

            el.classList.remove(...removeClasses);
            el.classList.add(isValid ? validClass : invalidClass);
        }

        // Handle error display
        const errorId = `${fieldName}-error`;
        let errorEl = document.getElementById(errorId);

        if (!isValid && errorConfig.enabled !== false) {
            const errorMessage = validator.errors[fieldName]?.[0] || '';
            const template = errorConfig.template || '<div class="{class}" id="{id}" style="display: {display}">{message}</div>';
            const containerClass = errorConfig.containerClass || 'validation-error text-red-500 text-sm mt-1';

            if (!errorEl) {
                const templateHtml = template
                    .replace('{class}', containerClass)
                    .replace('{id}', errorId)
                    .replace('{display}', 'block')
                    .replace('{message}', errorMessage);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = templateHtml;
                errorEl = tempDiv.firstElementChild;

                const position = errorConfig.position || 'after';
                if (position === 'before') {
                    el.parentNode.insertBefore(errorEl, el);
                } else {
                    el.parentNode.insertBefore(errorEl, el.nextSibling);
                }
            } else {
                errorEl.textContent = errorMessage;
                errorEl.style.display = 'block';
            }
        } else if (errorEl) {
            const showOn = errorConfig.showOn || ['fail'];
            if (isValid && !showOn.includes('pass')) {
                errorEl.style.display = 'none';
            } else if (isValid) {
                errorEl.textContent = '';
                errorEl.style.display = 'block';
            }
        }

        el.dispatchEvent(new CustomEvent('validation', {
            detail: { isValid, errors: validator.errors[fieldName] || [] }
        }));
    }
    Alpine.data('validateForm', (rules = {}, messages = {}, attributes = {}, options = {}) => {
        const config = {
            ajaxUrl: window.clientValidationConfig?.ajaxUrl || '/client-validation/validate',
            enableAjax: window.clientValidationConfig?.enableAjax !== false,
            ...window.clientValidationConfig?.options || {},
            ...options
        };

        return {
            validator: new Validator(rules, messages, attributes, config),
            errors: {},
            form: {},
            isValidating: false,

            init() {
                this.errors = {};
                this.form = Object.keys(rules).reduce((acc, key) => {
                    acc[key] = '';
                    return acc;
                }, {});

                this.$el.addEventListener('validation', (e) => {
                    const fieldName = e.target.name || e.target.getAttribute('name');
                    if (fieldName) {
                        this.updateErrors(fieldName, e.detail.isValid, e.detail.errors);
                    }
                });
            },

            updateErrors(fieldName, isValid, errors) {
                if (isValid) {
                    delete this.errors[fieldName];
                } else {
                    this.errors[fieldName] = errors;
                }
            },

            async validate(field = null) {
                this.isValidating = true;
                let isValid;

                if (field) {
                    isValid = await this.validateSingleField(field);
                } else {
                    isValid = await this.validator.validate(this.form);
                    this.errors = { ...this.validator.errors };
                }

                this.isValidating = false;
                return isValid;
            },

            async validateSingleField(field) {
                const value = this.form[field] || '';
                const isValid = await this.validator.validateField(field, value);
                this.updateErrors(field, isValid, this.validator.errors[field] || []);
                return isValid;
            },

            async submitForm(event) {
                if (!(await this.validate())) {
                    event.preventDefault();
                    return false;
                }
                return true;
            },

            hasError(field) {
                return this.errors[field]?.length > 0;
            },

            getError(field) {
                return this.hasError(field) ? this.errors[field][0] : '';
            },

            clearErrors(field = null) {
                if (field) {
                    delete this.errors[field];
                } else {
                    this.errors = {};
                }
            },

            isValid() {
                return Object.keys(this.errors).length === 0;
            }
        };
    });
}
