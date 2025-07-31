import validationRules from '../rules/index.js';

/**
 * Rule Engine for client-side validation rules
 */
class RuleEngine {
    constructor(rules = {}, messages = {}, attributes = {}) {
        this.rules = rules;
        this.messages = messages;
        this.attributes = attributes;
        this.validationRules = validationRules;
        this.customRules = new Map();
    }

    validateRule(field, value, rule, context = {}) {
        const [ruleName, ...paramsParts] = rule.split(':');
        const params = paramsParts.length > 0 ? paramsParts[0].split(',') : [];

        // Check custom rules first
        if (this.customRules.has(ruleName)) {
            const customRule = this.customRules.get(ruleName);
            const result = customRule(value, params, field, context);
            return {
                valid: result === true,
                message: result === true ? null : this.formatMessage(ruleName, field, params, result)
            };
        }

        // Check built-in rules
        if (this.validationRules[ruleName]) {
            const ruleContext = {
                rules: context.allRules || [],
                allData: context.allData || {},
                field,
                value
            };

            const isValid = this.validationRules[ruleName](value, params, ruleContext);
            return {
                valid: isValid,
                message: isValid ? null : this.formatMessage(ruleName, field, params)
            };
        }

        console.warn(`Unknown validation rule: ${ruleName}`);
        return { valid: true, message: null };
    }

    formatMessage(ruleName, field, params, customMessage = null) {
        if (customMessage && typeof customMessage === 'string') {
            return customMessage;
        }

        const fieldName = this.attributes[field] || field.replace(/_/g, ' ');

        // Check for custom message
        const messageKeys = [
            `${field}.${ruleName}`,
            ruleName
        ];

        for (const key of messageKeys) {
            if (this.messages[key]) {
                return this.interpolateMessage(this.messages[key], fieldName, params);
            }
        }

        // Default messages
        return this.getDefaultMessage(ruleName, fieldName, params);
    }

    interpolateMessage(message, fieldName, params) {
        return message
            .replace(':attribute', fieldName)
            .replace(':field', fieldName)
            .replace(/:(\w+)/g, (match, param) => {
                const index = parseInt(param) - 1;
                return params[index] !== undefined ? params[index] : match;
            });
    }

    getDefaultMessage(ruleName, fieldName, params) {
        const messages = {
            required: `The ${fieldName} field is required.`,
            email: `The ${fieldName} must be a valid email address.`,
            min: `The ${fieldName} must be at least ${params[0]} characters.`,
            max: `The ${fieldName} may not be greater than ${params[0]} characters.`,
            numeric: `The ${fieldName} must be a number.`,
            integer: `The ${fieldName} must be an integer.`,
            alpha: `The ${fieldName} may only contain letters.`,
            alpha_num: `The ${fieldName} may only contain letters and numbers.`,
            alpha_dash: `The ${fieldName} may only contain letters, numbers, dashes and underscores.`,
            url: `The ${fieldName} format is invalid.`,
            between: `The ${fieldName} must be between ${params[0]} and ${params[1]}.`,
            confirmed: `The ${fieldName} confirmation does not match.`,
            size: `The ${fieldName} must be ${params[0]} characters.`,
            in: `The selected ${fieldName} is invalid.`,
            not_in: `The selected ${fieldName} is invalid.`,
            boolean: `The ${fieldName} field must be true or false.`,
            date: `The ${fieldName} is not a valid date.`,
            after: `The ${fieldName} must be a date after ${params[0]}.`,
            before: `The ${fieldName} must be a date before ${params[0]}.`,
            same: `The ${fieldName} and ${params[0]} must match.`,
            different: `The ${fieldName} and ${params[0]} must be different.`,
            accepted: `The ${fieldName} must be accepted.`,
            digits: `The ${fieldName} must be ${params[0]} digits.`,
            digits_between: `The ${fieldName} must be between ${params[0]} and ${params[1]} digits.`,
            string: `The ${fieldName} must be a string.`,
            array: `The ${fieldName} must be an array.`,
            regex: `The ${fieldName} format is invalid.`,
        };

        return messages[ruleName] || `The ${fieldName} is invalid.`;
    }

    addCustomRule(name, validator, message = null) {
        this.customRules.set(name, validator);
        if (message) {
            this.messages[name] = message;
        }
    }

    removeCustomRule(name) {
        this.customRules.delete(name);
    }

    updateRules(rules) {
        this.rules = rules;
    }

    updateMessages(messages) {
        this.messages = messages;
    }

    updateAttributes(attributes) {
        this.attributes = attributes;
    }

    hasRule(ruleName) {
        return this.validationRules[ruleName] !== undefined || this.customRules.has(ruleName);
    }

    getAvailableRules() {
        return [
            ...Object.keys(this.validationRules),
            ...Array.from(this.customRules.keys())
        ];
    }

    // Rule validation with conditional logic
    validateConditionalRule(field, value, rule, allData = {}) {
        const [ruleName, conditions] = rule.split(':');

        // Handle conditional rules like required_if, required_unless, etc.
        switch (ruleName) {
            case 'required_if':
                return this.validateRequiredIf(field, value, conditions, allData);
            case 'required_unless':
                return this.validateRequiredUnless(field, value, conditions, allData);
            case 'required_with':
                return this.validateRequiredWith(field, value, conditions, allData);
            case 'required_without':
                return this.validateRequiredWithout(field, value, conditions, allData);
            default:
                return this.validateRule(field, value, rule);
        }
    }

    validateRequiredIf(field, value, conditions, allData) {
        const [otherField, ...expectedValues] = conditions.split(',');
        const otherValue = allData[otherField];

        if (expectedValues.includes(String(otherValue))) {
            return this.validateRule(field, value, 'required');
        }

        return { valid: true, message: null };
    }

    validateRequiredUnless(field, value, conditions, allData) {
        const [otherField, ...expectedValues] = conditions.split(',');
        const otherValue = allData[otherField];

        if (!expectedValues.includes(String(otherValue))) {
            return this.validateRule(field, value, 'required');
        }

        return { valid: true, message: null };
    }

    validateRequiredWith(field, value, conditions, allData) {
        const requiredFields = conditions.split(',');
        const hasAnyRequiredField = requiredFields.some(f => allData[f] !== undefined && allData[f] !== '');

        if (hasAnyRequiredField) {
            return this.validateRule(field, value, 'required');
        }

        return { valid: true, message: null };
    }

    validateRequiredWithout(field, value, conditions, allData) {
        const requiredFields = conditions.split(',');
        const missingFields = requiredFields.filter(f => allData[f] === undefined || allData[f] === '');

        if (missingFields.length > 0) {
            return this.validateRule(field, value, 'required');
        }

        return { valid: true, message: null };
    }
}

export default RuleEngine;
