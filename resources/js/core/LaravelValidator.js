/**
 * Laravel Client Validator
 *
 * The main validation engine that works with both client-side and remote rules.
 * Designed to be framework-agnostic - use with Alpine.js, Vanilla JS, or any framework.
 *
 * @example
 * // Basic usage
 * const validator = new Validator({
 *     rules: {
 *         email: 'required|email|unique:users',
 *         password: 'required|min:8|confirmed'
 *     },
 *     messages: {
 *         'email.unique': 'This email is already taken'
 *     }
 * });
 *
 * // Validate a single field
 * const result = await validator.validateField('email', 'test@example.com');
 *
 * // Validate entire form
 * const formResult = await validator.validateAll({ email: 'test@example.com', password: '12345678' });
 */

import RuleRegistry from './RuleRegistry.js';
import RemoteValidator from './RemoteValidator.js';
import EventEmitter from './EventEmitter.js';

export default class LaravelValidator {
    /**
     * Create a new Validator instance
     *
     * @param {Object} options - Configuration options
     * @param {Object} options.rules - Validation rules keyed by field name
     * @param {Object} options.messages - Custom error messages
     * @param {Object} options.attributes - Custom attribute names for fields
     * @param {string} options.remoteUrl - URL for remote validation
     * @param {number} options.debounce - Debounce time in ms for live validation
     */
    constructor(options = {}) {
        this.rules = this.normalizeRules(options.rules || {});
        this.messages = options.messages || {};
        this.attributes = options.attributes || {};

        this.options = {
            remoteUrl: options.remoteUrl || '/client-validation/validate',
            debounce: options.debounce || 300,
            stopOnFirstError: options.stopOnFirstError ?? true,
            ...options
        };

        // Core components
        this.registry = RuleRegistry;
        this.remote = new RemoteValidator({ url: this.options.remoteUrl });
        this.events = new EventEmitter();

        // State
        this.errors = {};
        this.validating = new Set();
        this.touched = new Set();
        this.debounceTimers = new Map();
    }

    /**
     * Normalize rules to consistent format
     */
    normalizeRules(rules) {
        const normalized = {};
        for (const [field, fieldRules] of Object.entries(rules)) {
            if (typeof fieldRules === 'string') {
                normalized[field] = fieldRules.split('|').filter(r => r.trim());
            } else if (Array.isArray(fieldRules)) {
                normalized[field] = fieldRules;
            } else {
                normalized[field] = [];
            }
        }
        return normalized;
    }

    /**
     * Parse a single rule string into name and parameters
     * @example parseRule('min:8') => { name: 'min', params: ['8'] }
     */
    parseRule(rule) {
        const [name, ...paramsParts] = rule.split(':');
        const params = paramsParts.length > 0 ? paramsParts[0].split(',') : [];
        return { name, params };
    }

    /**
     * Validate a single field
     *
     * @param {string} field - Field name
     * @param {*} value - Field value
     * @param {Object} allData - All form data (for rules like 'confirmed', 'same')
     * @returns {Promise<{valid: boolean, errors: string[]}>}
     */
    async validateField(field, value, allData = {}) {
        const fieldRules = this.rules[field];
        if (!fieldRules || fieldRules.length === 0) {
            return { valid: true, errors: [] };
        }

        this.validating.add(field);
        this.touched.add(field);

        await this.events.emit('field:validating', { field, value });

        const errors = [];
        let valid = true;

        for (const ruleString of fieldRules) {
            const { name, params } = this.parseRule(ruleString);

            // Skip nullable rule if value is empty and field has nullable
            if (name === 'nullable') continue;

            // Handle nullable - if field is nullable and value is empty, skip remaining rules
            if (this.hasRule(field, 'nullable') && this.isEmpty(value)) {
                break;
            }

            let result;

            // Check if this is a remote rule
            if (this.registry.isRemote(name)) {
                result = await this.remote.validate(field, value, name, params, {
                    messages: this.messages,
                    attributes: this.attributes
                });
            } else if (this.registry.has(name)) {
                // Client-side validation
                result = this.validateClientRule(field, value, name, params, allData);
            } else {
                // Unknown rule - treat as remote
                result = await this.remote.validate(field, value, name, params, {
                    messages: this.messages,
                    attributes: this.attributes
                });
            }

            if (!result.valid) {
                valid = false;
                const message = result.message || this.formatMessage(field, name, params);
                errors.push(message);

                if (this.options.stopOnFirstError) {
                    break;
                }
            }
        }

        // Update error state
        if (valid) {
            delete this.errors[field];
        } else {
            this.errors[field] = errors;
        }

        this.validating.delete(field);

        await this.events.emit('field:validated', { field, value, valid, errors });

        return { valid, errors };
    }

    /**
     * Validate a client-side rule
     */
    validateClientRule(field, value, ruleName, params, allData) {
        const validator = this.registry.get(ruleName);
        if (!validator) {
            return { valid: true, message: null };
        }

        // Build context for rules that need other field values
        const context = {
            field,
            allData,
            rules: this.rules[field]
        };

        try {
            const isValid = validator(value, params, context);
            return {
                valid: isValid,
                message: isValid ? null : this.formatMessage(field, ruleName, params)
            };
        } catch (error) {
            console.error(`Validation error for rule ${ruleName}:`, error);
            return { valid: false, message: 'Validation error occurred' };
        }
    }

    /**
     * Validate all fields
     *
     * @param {Object} data - Form data to validate
     * @returns {Promise<{valid: boolean, errors: Object}>}
     */
    async validateAll(data = {}) {
        await this.events.emit('form:validating', { data });

        const results = {};
        let formValid = true;

        for (const field of Object.keys(this.rules)) {
            const value = data[field] !== undefined ? data[field] : '';
            const result = await this.validateField(field, value, data);
            results[field] = result;

            if (!result.valid) {
                formValid = false;
            }
        }

        await this.events.emit('form:validated', { valid: formValid, errors: this.errors, results });

        return {
            valid: formValid,
            errors: { ...this.errors },
            results
        };
    }

    /**
     * Validate field with debounce (for live validation)
     */
    validateFieldDebounced(field, value, allData = {}) {
        return new Promise((resolve) => {
            // Clear existing timer
            if (this.debounceTimers.has(field)) {
                clearTimeout(this.debounceTimers.get(field));
            }

            // Set new timer
            const timer = setTimeout(async () => {
                const result = await this.validateField(field, value, allData);
                this.debounceTimers.delete(field);
                resolve(result);
            }, this.options.debounce);

            this.debounceTimers.set(field, timer);
        });
    }

    /**
     * Format error message with placeholders
     */
    formatMessage(field, ruleName, params) {
        // Check for custom message
        const customKey = `${field}.${ruleName}`;
        let message = this.messages[customKey] || this.messages[ruleName] || this.registry.getMessage(ruleName);

        // Get display name for field
        const displayName = this.attributes[field] || field.replace(/_/g, ' ');

        // Replace placeholders
        message = message
            .replace(/:attribute/g, displayName)
            .replace(/:field/g, displayName)
            .replace(/:min/g, params[0] || '')
            .replace(/:max/g, params[1] || params[0] || '')
            .replace(/:size/g, params[0] || '')
            .replace(/:digits/g, params[0] || '')
            .replace(/:date/g, params[0] || '')
            .replace(/:other/g, params[0] || '');

        return message;
    }

    /**
     * Check if field has a specific rule
     */
    hasRule(field, ruleName) {
        const fieldRules = this.rules[field] || [];
        return fieldRules.some(r => this.parseRule(r).name === ruleName);
    }

    /**
     * Check if value is empty
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }

    // ==================== State Methods ====================

    /**
     * Get errors for a field
     */
    getErrors(field) {
        return this.errors[field] || [];
    }

    /**
     * Get first error for a field
     */
    getError(field) {
        const errors = this.getErrors(field);
        return errors.length > 0 ? errors[0] : null;
    }

    /**
     * Check if field has errors
     */
    hasError(field) {
        return this.errors[field] && this.errors[field].length > 0;
    }

    /**
     * Check if any field has errors
     */
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Check if field is currently validating
     */
    isValidating(field = null) {
        if (field) {
            return this.validating.has(field);
        }
        return this.validating.size > 0;
    }

    /**
     * Check if field has been touched (validated at least once)
     */
    isTouched(field) {
        return this.touched.has(field);
    }

    /**
     * Check if field is valid (touched and no errors)
     */
    isValid(field = null) {
        if (field) {
            return this.touched.has(field) && !this.hasError(field);
        }
        // Check all fields
        for (const f of Object.keys(this.rules)) {
            if (this.hasError(f)) return false;
        }
        return this.touched.size > 0;
    }

    /**
     * Clear errors for a field or all fields
     */
    clearErrors(field = null) {
        if (field) {
            delete this.errors[field];
            this.touched.delete(field);
        } else {
            this.errors = {};
            this.touched.clear();
        }
    }

    /**
     * Reset validator state
     */
    reset() {
        this.errors = {};
        this.touched.clear();
        this.validating.clear();
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }

    // ==================== Rule Management ====================

    /**
     * Add or update rules
     */
    setRules(rules) {
        this.rules = { ...this.rules, ...this.normalizeRules(rules) };
    }

    /**
     * Set custom messages
     */
    setMessages(messages) {
        this.messages = { ...this.messages, ...messages };
    }

    /**
     * Set custom attribute names
     */
    setAttributes(attributes) {
        this.attributes = { ...this.attributes, ...attributes };
    }

    /**
     * Register a custom validation rule
     */
    extend(name, validator, message = null) {
        this.registry.extend(name, validator, message);
    }

    // ==================== Event Hooks ====================

    /**
     * Hook: Before field validation
     */
    beforeFieldValidate(callback) {
        this.events.on('field:validating', callback);
        return this;
    }

    /**
     * Hook: After field validation
     */
    afterFieldValidate(callback) {
        this.events.on('field:validated', callback);
        return this;
    }

    /**
     * Hook: Before form validation
     */
    beforeValidate(callback) {
        this.events.on('form:validating', callback);
        return this;
    }

    /**
     * Hook: After form validation
     */
    afterValidate(callback) {
        this.events.on('form:validated', callback);
        return this;
    }

    /**
     * Destroy validator instance
     */
    destroy() {
        this.reset();
        this.events.removeAll();
    }
}
