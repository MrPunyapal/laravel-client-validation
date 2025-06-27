import Validator from '../core/validator.js';

export default function (Alpine) {
    Alpine.directive('validate', (el, { expression, modifiers }, { evaluateLater, effect, cleanup }) => {
        const getRule = evaluateLater(expression);
        let validator = null;
        let fieldName = el.name || el.getAttribute('name') || 'field';

        effect(() => {
            getRule(rule => {
                if (rule) {
                    validator = new Validator({ [fieldName]: rule });
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
        const validateField = () => {
            const value = el.value;
            const isValid = validator.validateField(fieldName, value);
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
                const submitHandler = (e) => {
                    if (!validateField()) {
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
        el.classList.remove('is-valid', 'is-invalid');
        el.classList.add(isValid ? 'is-valid' : 'is-invalid');

        const errorId = `${fieldName}-error`;
        let errorEl = document.getElementById(errorId);

        if (!isValid) {
            const errorMessage = validator.errors[fieldName]?.[0] || '';

            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.id = errorId;
                errorEl.className = 'validation-error text-red-500 text-sm mt-1';
                el.parentNode.insertBefore(errorEl, el.nextSibling);
            }

            errorEl.textContent = errorMessage;
            errorEl.style.display = 'block';
        } else if (errorEl) {
            errorEl.style.display = 'none';
        }

        el.dispatchEvent(new CustomEvent('validation', {
            detail: { isValid, errors: validator.errors[fieldName] || [] }
        }));
    }
    Alpine.data('validateForm', (rules = {}, messages = {}, attributes = {}) => {
        return {
            validator: new Validator(rules, messages, attributes),
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

            validate(field = null) {
                this.isValidating = true;
                let isValid;

                if (field) {
                    isValid = this.validateSingleField(field);
                } else {
                    isValid = this.validator.validate(this.form);
                    this.errors = { ...this.validator.errors };
                }

                this.isValidating = false;
                return isValid;
            },

            validateSingleField(field) {
                const value = this.form[field] || '';
                const isValid = this.validator.validateField(field, value);
                this.updateErrors(field, isValid, this.validator.errors[field] || []);
                return isValid;
            },

            submitForm(event) {
                if (!this.validate()) {
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
