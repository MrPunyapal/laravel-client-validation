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
            required_if: 'The :attribute field is required when :other is :value.',
            required_unless: 'The :attribute field is required unless :other is in :values.',
            required_with: 'The :attribute field is required when :values is present.',
            required_without: 'The :attribute field is required when :values is not present.',
            after_or_equal: 'The :attribute must be a date after or equal to :date.',
            before_or_equal: 'The :attribute must be a date before or equal to :date.',
            multiple_of: 'The :attribute must be a multiple of :value.',
            decimal: 'The :attribute must have :decimal decimal places.',
            distinct: 'The :attribute field has a duplicate value.',
            mac_address: 'The :attribute must be a valid MAC address.',
            ascii: 'The :attribute must only contain ASCII characters.',
            prohibited: 'The :attribute field is prohibited.',
            prohibited_if: 'The :attribute field is prohibited when :other is :value.',
            prohibited_unless: 'The :attribute field is prohibited unless :other is in :values.',
            accepted_if: 'The :attribute must be accepted when :other is :value.',
            declined: 'The :attribute must be declined.',
            declined_if: 'The :attribute must be declined when :other is :value.',
            date_equals: 'The :attribute must be a date equal to :date.',
            doesnt_start_with: 'The :attribute may not start with: :values.',
            doesnt_end_with: 'The :attribute may not end with: :values.',
            required_with_all: 'The :attribute field is required when :values are present.',
            required_without_all: 'The :attribute field is required when none of :values are present.',
            min_digits: 'The :attribute must have at least :min digits.',
            max_digits: 'The :attribute must not have more than :max digits.',
            date_format: 'The :attribute does not match the format :format.',
            timezone: 'The :attribute must be a valid timezone.',
            required_array_keys: 'The :attribute must contain entries for: :values.',
            active_url: 'The :attribute must be a valid URL.',
            ulid: 'The :attribute must be a valid ULID.',
            hex_color: 'The :attribute must be a valid hexadecimal color.',
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
