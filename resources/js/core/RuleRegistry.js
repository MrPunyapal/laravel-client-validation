/**
 * Rule Registry - Manages validation rules (client and remote).
 */
import validationRules from './rules/index.js';

class RuleRegistry {
    constructor() {
        this.clientRules = new Map(Object.entries(validationRules));
        this.customRules = new Map();
        this.remoteRules = new Set(['unique', 'exists', 'password', 'current_password']);

        this.defaultMessages = {
            required: 'The :attribute field is required.',
            email: 'The :attribute must be a valid email address.',
            min: 'The :attribute must be at least :min characters.',
            max: 'The :attribute may not be greater than :max characters.',
            numeric: 'The :attribute must be a number.',
            integer: 'The :attribute must be an integer.',
            alpha: 'The :attribute may only contain letters.',
            alpha_num: 'The :attribute may only contain letters and numbers.',
            alpha_dash: 'The :attribute may only contain letters, numbers, dashes and underscores.',
            url: 'The :attribute must be a valid URL.',
            between: 'The :attribute must be between :min and :max.',
            confirmed: 'The :attribute confirmation does not match.',
            size: 'The :attribute must be :size characters.',
            in: 'The selected :attribute is invalid.',
            not_in: 'The selected :attribute is invalid.',
            boolean: 'The :attribute field must be true or false.',
            date: 'The :attribute is not a valid date.',
            after: 'The :attribute must be a date after :date.',
            before: 'The :attribute must be a date before :date.',
            same: 'The :attribute and :other must match.',
            different: 'The :attribute and :other must be different.',
            accepted: 'The :attribute must be accepted.',
            digits: 'The :attribute must be :digits digits.',
            digits_between: 'The :attribute must be between :min and :max digits.',
            string: 'The :attribute must be a string.',
            regex: 'The :attribute format is invalid.',
            unique: 'The :attribute has already been taken.',
            exists: 'The selected :attribute is invalid.',
            gt: 'The :attribute must be greater than :other.',
            gte: 'The :attribute must be greater than or equal to :other.',
            lt: 'The :attribute must be less than :other.',
            lte: 'The :attribute must be less than or equal to :other.',
            filled: 'The :attribute field must have a value when present.',
            present: 'The :attribute field must be present.',
            starts_with: 'The :attribute must start with one of: :values.',
            ends_with: 'The :attribute must end with one of: :values.',
            uuid: 'The :attribute must be a valid UUID.',
            json: 'The :attribute must be a valid JSON string.',
            lowercase: 'The :attribute must be lowercase.',
            uppercase: 'The :attribute must be uppercase.',
            ip: 'The :attribute must be a valid IP address.',
            ipv4: 'The :attribute must be a valid IPv4 address.',
            ipv6: 'The :attribute must be a valid IPv6 address.',
        };
    }

    has(ruleName) {
        return this.clientRules.has(ruleName) || this.customRules.has(ruleName);
    }

    get(ruleName) {
        return this.customRules.get(ruleName) || this.clientRules.get(ruleName);
    }

    isRemote(ruleName) {
        return this.remoteRules.has(ruleName);
    }

    extend(name, validator, message = null) {
        this.customRules.set(name, validator);
        if (message) this.defaultMessages[name] = message;
    }

    registerRemote(name) {
        this.remoteRules.add(name);
    }

    getMessage(ruleName) {
        return this.defaultMessages[ruleName] || 'The :attribute is invalid.';
    }

    getAvailableRules() {
        return [...this.clientRules.keys(), ...this.customRules.keys()];
    }
}

// Singleton instance
const registry = new RuleRegistry();
export default registry;
