import validationRules from './rules/index.js';

class Validator {
    constructor(rules = {}, messages = {}, attributes = {}) {
        this.rules = rules;
        this.messages = messages;
        this.attributes = attributes;
        this.errors = {};
        this.validationRules = validationRules;
    }

    validateField(field, value, rules) {
        const fieldRules = rules || this.rules[field] || '';
        if (!fieldRules) return true;

        const rulesList = this._parseRules(fieldRules);
        let isValid = true;
        this.errors[field] = [];

        for (const rule of rulesList) {
            const [ruleName, ...paramsParts] = rule.split(':');
            // Handle comma-separated parameters for rules like 'in:active,inactive,pending'
            // but NOT for regex patterns
            let params = paramsParts;
            if (paramsParts.length === 1 && paramsParts[0] &&
                paramsParts[0].includes(',') && ruleName !== 'regex') {
                params = paramsParts[0].split(',');
            }

            // Pass the full rules list as context to individual rules
            const ruleContext = { rules: rulesList, allData: this.allData || {} };

            if (!this._testRule(ruleName, value, params, field, ruleContext)) {
                isValid = false;
                this.errors[field].push(this._formatMessage(ruleName, field, params));
            }
        }

        return isValid;
    }

    validate(data = {}) {
        this.errors = {};
        this.allData = data;
        let isValid = true;

        for (const field in this.rules) {
            const value = data[field] !== undefined ? data[field] : '';
            if (!this.validateField(field, value)) {
                isValid = false;
            }
        }

        return isValid;
    }

    _parseRules(rules) {
        if (Array.isArray(rules)) return rules;
        return rules.split('|').filter(rule => rule.trim() !== '');
    }

    _testRule(rule, value, params, field, context = {}) {
        if (this.validationRules[rule]) {
            return this.validationRules[rule](value, params, field, context);
        }

        const method = `_${rule}Rule`;
        if (typeof this[method] === 'function') {
            return this[method](value, params, field, context);
        }

        console.warn(`Validation rule '${rule}' not implemented`);
        return true;
    }

    _formatMessage(rule, field, params) {
        let message = this.messages[`${field}.${rule}`] ||
            this.messages[rule] ||
            `The ${this._getAttributeName(field)} is invalid.`;

        message = message.replace(':attribute', this._getAttributeName(field));

        params.forEach((param, i) => {
            message = message.replace(`:param${i + 1}`, param);
            message = message.replace(':min', param);
            message = message.replace(':max', param);
            message = message.replace(':size', param);
        });
        return message;
    }

    _getAttributeName(field) {
        return this.attributes[field] || field.replace(/[_-]/g, ' ');
    }
}

export default Validator;
