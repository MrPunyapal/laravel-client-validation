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
            
            init() {
                this.errors = {};
            },
            
            validate(field = null) {
                if (field) {
                    const input = this.$el.querySelector(`[name="${field}"]`);
                    if (input) {
                        const isValid = this.validator.validateField(field, input.value);
                        this.errors = { ...this.validator.errors };
                        return isValid;
                    }
                    return true;
                }
                
                const data = Object.fromEntries(
                    new FormData(this.$el).entries()
                );
                
                const isValid = this.validator.validate(data);
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
