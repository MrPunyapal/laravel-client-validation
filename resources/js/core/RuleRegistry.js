/**
 * Rule Registry - Manages validation rules
 *
 * Provides a centralized registry for all validation rules (client and remote).
 */
import validationRules from './rules/index.js';

class RuleRegistry {
    constructor() {
        // Built-in client-side rules
        this.clientRules = new Map(Object.entries(validationRules));

        // Custom rules added at runtime
        this.customRules = new Map();

        // Rules that require server-side validation
        this.remoteRules = new Set([
            'unique', 'exists', 'password', 'current_password'
        ]);

        // Default messages for each rule
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
        };
    }

    /**
     * Check if a rule exists (client or custom)
     */
    has(ruleName) {
        return this.clientRules.has(ruleName) || this.customRules.has(ruleName);
    }

    /**
     * Get a rule validator function
     */
    get(ruleName) {
        if (this.customRules.has(ruleName)) {
            return this.customRules.get(ruleName);
        }
        return this.clientRules.get(ruleName);
    }

    /**
     * Check if rule requires remote (server-side) validation
     */
    isRemote(ruleName) {
        return this.remoteRules.has(ruleName);
    }

    /**
     * Register a custom rule
     */
    extend(name, validator, message = null) {
        this.customRules.set(name, validator);
        if (message) {
            this.defaultMessages[name] = message;
        }
    }

    /**
     * Register a rule as remote (server-side only)
     */
    registerRemote(name) {
        this.remoteRules.add(name);
    }

    /**
     * Get default message for a rule
     */
    getMessage(ruleName) {
        return this.defaultMessages[ruleName] || 'The :attribute is invalid.';
    }

    /**
     * Get all available rules
     */
    getAvailableRules() {
        return [
            ...this.clientRules.keys(),
            ...this.customRules.keys()
        ];
    }
}

// Singleton instance
const registry = new RuleRegistry();
export default registry;
