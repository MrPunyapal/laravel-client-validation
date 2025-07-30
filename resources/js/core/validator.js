import validationRules from './rules/index.js';

class Validator {
    constructor(rules = {}, messages = {}, attributes = {}, options = {}) {
        this.rules = rules;
        this.messages = messages;
        this.attributes = attributes;
        this.errors = {};
        this.validationRules = validationRules;
        this.options = {
            ajaxUrl: '/client-validation/validate',
            ajaxTimeout: 5000,
            enableAjax: true,
            ...options
        };
    }

    async validateField(field, value, rules) {
        const fieldRules = rules || this.rules[field] || '';
        if (!fieldRules) return true;

        const rulesList = this._parseRules(fieldRules);
        let isValid = true;
        this.errors[field] = [];

        for (const rule of rulesList) {
            const [ruleName, ...paramsParts] = rule.split(':');
            let params = paramsParts;
            if (paramsParts.length === 1 && paramsParts[0] &&
                paramsParts[0].includes(',') && ruleName !== 'regex') {
                params = paramsParts[0].split(',');
            }

            const ruleContext = { rules: rulesList, allData: this.allData || {} };

            // Handle AJAX rules
            if (rule.startsWith('ajax:')) {
                const ajaxRule = rule.substring(5); // Remove 'ajax:' prefix
                const ajaxResult = await this._testAjaxRule(ajaxRule, value, field);
                if (!ajaxResult.valid) {
                    isValid = false;
                    this.errors[field].push(ajaxResult.message || this._formatMessage(ruleName, field, params));
                }
            } else if (!this._testRule(ruleName, value, params, field, ruleContext)) {
                isValid = false;
                this.errors[field].push(this._formatMessage(ruleName, field, params));
            }
        }

        return isValid;
    }

    async validate(data = {}) {
        this.errors = {};
        this.allData = data;
        let isValid = true;

        for (const field in this.rules) {
            const value = data[field] !== undefined ? data[field] : '';
            if (!(await this.validateField(field, value))) {
                isValid = false;
            }
        }

        return isValid;
    }

    async _testAjaxRule(rule, value, field) {
        if (!this.options.enableAjax) {
            console.warn(`AJAX validation disabled but rule '${rule}' requires server validation`);
            return { valid: true };
        }

        try {
            const [ruleName, ...paramsParts] = rule.split(':');
            const response = await fetch(this.options.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    field,
                    value,
                    rule: ruleName,
                    parameters: paramsParts.length > 0 ? paramsParts[0].split(',') : [],
                    messages: this.messages,
                    attributes: this.attributes
                }),
                signal: AbortSignal.timeout(this.options.ajaxTimeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AJAX validation error:', error);
            return { valid: true, message: 'Validation temporarily unavailable' };
        }
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

    clearErrors() {
        this.errors = {};
    }
}

export default Validator;
