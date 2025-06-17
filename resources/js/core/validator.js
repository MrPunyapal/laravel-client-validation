class Validator {
    constructor(rules = {}, messages = {}, attributes = {}) {
        this.rules = rules;
        this.messages = messages;
        this.attributes = attributes;
        this.errors = {};
    }

    validateField(field, value, rules) {
        const fieldRules = rules || this.rules[field] || '';
        if (!fieldRules) return true;

        const rulesList = this._parseRules(fieldRules);
        let isValid = true;
        this.errors[field] = [];

        for (const rule of rulesList) {
            const [ruleName, ...params] = rule.split(':');
            if (!this._testRule(ruleName, value, params, field)) {
                isValid = false;
                this.errors[field].push(this._formatMessage(ruleName, field, params));
            }
        }

        return isValid;
    }

    validate(data = {}) {
        this.errors = {};
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

    _testRule(rule, value, params, field) {
        const method = `_${rule}Rule`;
        if (typeof this[method] === 'function') {
            return this[method](value, params, field);
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
            message = message.replace(`:param${i+1}`, param);
            message = message.replace(`:min`, param);
            message = message.replace(`:max`, param);
            message = message.replace(`:size`, param);
        });
        
        return message;
    }

    _getAttributeName(field) {
        return this.attributes[field] || field.replace(/[_-]/g, ' ');
    }

    _requiredRule(value) {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        return value !== null && value !== undefined;
    }

    _emailRule(value) {
        if (!value) return true;
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(value);
    }

    _minRule(value, [min]) {
        if (!value) return true;
        if (typeof value === 'string') return value.length >= Number(min);
        if (typeof value === 'number') return value >= Number(min);
        return true;
    }

    _maxRule(value, [max]) {
        if (!value) return true;
        if (typeof value === 'string') return value.length <= Number(max);
        if (typeof value === 'number') return value <= Number(max);
        return true;
    }

    _numericRule(value) {
        if (!value) return true;
        return !isNaN(value) && !isNaN(parseFloat(value));
    }

    _integerRule(value) {
        if (!value) return true;
        return Number.isInteger(Number(value));
    }

    _alphaRule(value) {
        if (!value) return true;
        return /^[a-zA-Z]+$/.test(value);
    }

    _alphaNumRule(value) {
        if (!value) return true;
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    _alphaDashRule(value) {
        if (!value) return true;
        return /^[a-zA-Z0-9_-]+$/.test(value);
    }

    _urlRule(value) {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    _betweenRule(value, [min, max]) {
        if (!value) return true;
        const length = typeof value === 'string' ? value.length : Number(value);
        return length >= Number(min) && length <= Number(max);
    }

    _confirmedRule(value, params, field, data = {}) {
        const confirmationField = `${field}_confirmation`;
        return value === data[confirmationField];
    }
}

export default Validator;
