import Validator from '../core/validator.js';

export default function (Alpine) {
    Alpine.directive('validate', (el, { expression }, { evaluateLater, effect }) => {
        const getRule = evaluateLater(expression);

        effect(() => {
            getRule(rule => {
                el.setAttribute('data-rules', rule);
            });
        });
    });
    Alpine.data('validateForm', (rules = {}, messages = {}, attributes = {}) => {
        return {
            validator: new Validator(rules, messages, attributes),
            errors: {},
            form: {},

            init() {
                this.errors = {};
                // Initialize form with empty values for each rule
                this.form = Object.keys(rules).reduce((acc, key) => {
                    acc[key] = '';
                    return acc;
                }, {});
            },
            validate(field = null) {
                if (field) {
                    const value = this.form[field] || '';
                    const isValid = this.validator.validateField(field, value);
                    this.errors = { ...this.validator.errors };
                    return isValid;
                }

                const isValid = this.validator.validate(this.form);
                this.errors = { ...this.validator.errors };
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
                return this.errors[field] && this.errors[field].length > 0;
            },

            getError(field) {
                return this.hasError(field) ? this.errors[field][0] : '';
            }
        };
    });
}
