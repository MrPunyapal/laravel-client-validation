import RuleEngine from './rule-engine.js';
import AjaxValidator from './ajax-validator.js';
import ErrorManager from './error-manager.js';
import EventManager from './event-manager.js';

/**
 * Validator class with hook support and better architecture
 */
class ClientValidator {
    constructor(rules = {}, messages = {}, attributes = {}, options = {}) {
        this.rules = rules;
        this.messages = messages;
        this.attributes = attributes;
        this.options = {
            ajaxUrl: '/client-validation/validate',
            ajaxTimeout: 5000,
            enableAjax: true,
            debounceMs: 300,
            ...options
        };

        this.ruleEngine = new RuleEngine(rules, messages, attributes);
        this.ajaxValidator = new AjaxValidator(this.options);
        this.errorManager = new ErrorManager(this.options);
        this.eventManager = new EventManager();

        this.validationState = new Map();
        this.isValidating = false;
        this.validationPromises = new Map();
    }

    // Hook management
    beforeValidate(callback) {
        this.eventManager.on('before:validate', callback);
        return this;
    }

    afterValidate(callback) {
        this.eventManager.on('after:validate', callback);
        return this;
    }

    onPasses(callback) {
        this.eventManager.on('validation:passes', callback);
        return this;
    }

    onFails(callback) {
        this.eventManager.on('validation:fails', callback);
        return this;
    }

    beforeFieldValidate(callback) {
        this.eventManager.on('before:field-validate', callback);
        return this;
    }

    afterFieldValidate(callback) {
        this.eventManager.on('after:field-validate', callback);
        return this;
    }

    // Field validation with debouncing and promise management
    async validateField(field, value, rules = null, options = {}) {
        const fieldRules = rules || this.rules[field] || '';
        if (!fieldRules) return { valid: true, errors: [] };

        // Cancel any pending validation for this field
        if (this.validationPromises.has(field)) {
            this.validationPromises.get(field).cancel();
        }

        const validationId = Date.now();
        let cancelled = false;

        const promise = new Promise(async (resolve) => {
            if (options.debounce !== false) {
                await this.debounce(field, this.options.debounceMs);
            }

            if (cancelled) return resolve({ valid: true, errors: [], cancelled: true });

            const context = {
                field,
                value,
                rules: fieldRules,
                validationId,
                options
            };

            await this.eventManager.emit('before:field-validate', context);

            const result = await this._performFieldValidation(field, value, fieldRules, context);

            if (!cancelled) {
                this.validationState.set(field, result);
                await this.eventManager.emit('after:field-validate', { ...context, result });
            }

            resolve(result);
        });

        promise.cancel = () => { cancelled = true; };
        this.validationPromises.set(field, promise);

        return promise;
    }

    // Form validation
    async validate(data = {}, options = {}) {
        this.isValidating = true;
        const context = { data, options, startTime: Date.now() };

        await this.eventManager.emit('before:validate', context);

        let isValid = true;
        const results = {};
        const validationPromises = [];

        for (const field in this.rules) {
            const value = data[field] !== undefined ? data[field] : '';
            const promise = this.validateField(field, value, null, { debounce: false });
            validationPromises.push(promise.then(result => {
                results[field] = result;
                if (!result.valid) isValid = false;
            }));
        }

        await Promise.all(validationPromises);

        const finalResult = {
            valid: isValid,
            results,
            duration: Date.now() - context.startTime
        };

        context.result = finalResult;
        await this.eventManager.emit('after:validate', context);

        if (isValid) {
            await this.eventManager.emit('validation:passes', context);
        } else {
            await this.eventManager.emit('validation:fails', context);
        }

        this.isValidating = false;
        return finalResult;
    }

    // Get validation state
    getFieldState(field) {
        return this.validationState.get(field) || { valid: true, errors: [] };
    }

    isFieldValid(field) {
        return this.getFieldState(field).valid;
    }

    getFieldErrors(field) {
        return this.getFieldState(field).errors || [];
    }

    getFirstFieldError(field) {
        const errors = this.getFieldErrors(field);
        return errors.length > 0 ? errors[0] : null;
    }

    hasError(field) {
        return !this.isFieldValid(field);
    }

    hasAnyErrors() {
        for (const [field, state] of this.validationState) {
            if (!state.valid) return true;
        }
        return false;
    }

    isValid() {
        if (this.validationState.size === 0) return false;

        for (const field in this.rules) {
            if (!this.isFieldValid(field)) return false;
        }
        return true;
    }

    clearErrors(field = null) {
        if (field) {
            this.validationState.delete(field);
            this.errorManager.clearFieldErrors(field);
        } else {
            this.validationState.clear();
            this.errorManager.clearAllErrors();
        }
    }

    // Error management
    displayError(field, errors, options = {}) {
        this.errorManager.displayFieldError(field, errors, options);
    }

    hideError(field) {
        this.errorManager.hideFieldError(field);
    }

    // Internal validation logic
    async _performFieldValidation(field, value, fieldRules, context) {
        const rulesList = this._parseRules(fieldRules);
        const errors = [];
        let valid = true;

        for (const rule of rulesList) {
            const result = await this._validateSingleRule(field, value, rule, context);
            if (!result.valid) {
                valid = false;
                errors.push(result.message);
                // Stop on first error unless configured otherwise
                if (this.options.stopOnFirstError !== false) break;
            }
        }

        return { valid, errors, field, value };
    }

    async _validateSingleRule(field, value, rule, context) {
        if (rule.startsWith('ajax:')) {
            return await this.ajaxValidator.validateRule(field, value, rule.substring(5), {
                messages: this.messages,
                attributes: this.attributes,
                context
            });
        }

        return this.ruleEngine.validateRule(field, value, rule, context);
    }

    _parseRules(rules) {
        if (typeof rules === 'string') {
            return rules.split('|').filter(rule => rule.trim());
        }
        if (Array.isArray(rules)) {
            return rules;
        }
        return [];
    }

    async debounce(field, ms) {
        return new Promise(resolve => {
            const key = `debounce_${field}`;
            if (this[key]) clearTimeout(this[key]);
            this[key] = setTimeout(resolve, ms);
        });
    }

    // Utility methods
    setRules(rules) {
        this.rules = { ...this.rules, ...rules };
        this.ruleEngine.updateRules(this.rules);
    }

    setMessages(messages) {
        this.messages = { ...this.messages, ...messages };
        this.ruleEngine.updateMessages(this.messages);
    }

    setAttributes(attributes) {
        this.attributes = { ...this.attributes, ...attributes };
        this.ruleEngine.updateAttributes(this.attributes);
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
        this.ajaxValidator.updateOptions(this.options);
        this.errorManager.updateOptions(this.options);
    }

    destroy() {
        this.clearErrors();
        this.eventManager.removeAllListeners();
        this.validationPromises.clear();
        this.validationState.clear();
    }
}

export default ClientValidator;
