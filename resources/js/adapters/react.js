/**
 * React Adapter for Laravel Client Validation
 * Provides hooks and components for React applications.
 */

import LaravelValidator from '../core/LaravelValidator.js';

function getConfig() {
    return window.LaravelClientValidation?.config || {
        remoteUrl: '/client-validation/validate',
        debounce: 300,
        errorClass: 'text-red-500 text-sm mt-1',
        validClass: 'border-green-500',
        invalidClass: 'border-red-500',
    };
}

/**
 * React hook for form validation
 * @param {Object} options - Validation options
 * @returns {Object} - Validation state and methods
 */
export function useValidation(options = {}) {
    const config = { ...getConfig(), ...options };

    let validator = null;
    let errors = {};
    let touched = new Set();
    let validating = false;
    let subscribers = [];

    const notify = () => {
        subscribers.forEach(fn => fn(getState()));
    };

    const getState = () => ({
        errors: { ...errors },
        touched: new Set(touched),
        validating,
    });

    const init = () => {
        if (!validator && options.rules) {
            validator = new LaravelValidator({
                rules: options.rules,
                messages: options.messages || {},
                attributes: options.attributes || {},
                remoteUrl: config.remoteUrl,
                debounce: config.debounce,
            });
        }
        return validator;
    };

    const validateField = async (field, value, allData = {}) => {
        init();
        if (!validator) return { valid: true, errors: [] };

        touched.add(field);
        validating = true;
        notify();

        try {
            const result = await validator.validateField(field, value, allData);
            errors[field] = result.errors;
            return result;
        } finally {
            validating = false;
            notify();
        }
    };

    const validateAll = async (data = {}) => {
        init();
        if (!validator) return { valid: true, errors: {} };

        validating = true;
        notify();

        try {
            const result = await validator.validateAll(data);
            Object.entries(result.results).forEach(([field, fieldResult]) => {
                touched.add(field);
                errors[field] = fieldResult.errors;
            });
            return result;
        } finally {
            validating = false;
            notify();
        }
    };

    const hasError = (field) => (errors[field]?.length || 0) > 0;
    const getError = (field) => errors[field]?.[0] || null;
    const getErrors = (field) => errors[field] || [];
    const getAllErrors = () => ({ ...errors });

    const clearErrors = (field = null) => {
        if (field) {
            delete errors[field];
            touched.delete(field);
        } else {
            errors = {};
            touched.clear();
        }
        if (validator) validator.clearErrors(field);
        notify();
    };

    const isTouched = (field) => touched.has(field);
    const isValid = (field) => isTouched(field) && !hasError(field);
    const hasErrors = () => Object.values(errors).some(e => e.length > 0);

    const subscribe = (fn) => {
        subscribers.push(fn);
        return () => {
            subscribers = subscribers.filter(s => s !== fn);
        };
    };

    const destroy = () => {
        if (validator) validator.destroy();
        subscribers = [];
    };

    return {
        init,
        validateField,
        validateAll,
        hasError,
        getError,
        getErrors,
        getAllErrors,
        clearErrors,
        isTouched,
        isValid,
        hasErrors,
        subscribe,
        destroy,
        get validating() { return validating; },
    };
}

/**
 * Create a validation instance for use outside React
 */
export function createReactValidator(options = {}) {
    return useValidation(options);
}

/**
 * Field validator class for imperative use
 */
export class ReactValidator {
    constructor(options = {}) {
        this.config = { ...getConfig(), ...options };
        this.validator = null;
        this.errors = {};
        this.touched = new Set();
        this.validating = false;
        this.listeners = new Map();

        if (options.rules) {
            this.init(options);
        }
    }

    init(options) {
        this.validator = new LaravelValidator({
            rules: options.rules || {},
            messages: options.messages || {},
            attributes: options.attributes || {},
            remoteUrl: this.config.remoteUrl,
            debounce: this.config.debounce,
        });
        return this;
    }

    async validateField(field, value, allData = {}) {
        if (!this.validator) return { valid: true, errors: [] };

        this.touched.add(field);
        this.validating = true;
        this.emit('validating', { field });

        try {
            const result = await this.validator.validateField(field, value, allData);
            this.errors[field] = result.errors;
            this.emit('validated', { field, result });
            return result;
        } finally {
            this.validating = false;
        }
    }

    async validateAll(data = {}) {
        if (!this.validator) return { valid: true, errors: {} };

        this.validating = true;
        this.emit('validating:all');

        try {
            const result = await this.validator.validateAll(data);
            Object.entries(result.results).forEach(([field, fieldResult]) => {
                this.touched.add(field);
                this.errors[field] = fieldResult.errors;
            });
            this.emit('validated:all', { result });
            return result;
        } finally {
            this.validating = false;
        }
    }

    hasError(field) {
        return (this.errors[field]?.length || 0) > 0;
    }

    getError(field) {
        return this.errors[field]?.[0] || null;
    }

    getErrors(field) {
        return this.errors[field] || [];
    }

    getAllErrors() {
        return { ...this.errors };
    }

    clearErrors(field = null) {
        if (field) {
            delete this.errors[field];
            this.touched.delete(field);
        } else {
            this.errors = {};
            this.touched.clear();
        }
        if (this.validator) {
            this.validator.clearErrors(field);
        }
        this.emit('cleared', { field });
    }

    isTouched(field) {
        return this.touched.has(field);
    }

    isValid(field) {
        return this.isTouched(field) && !this.hasError(field);
    }

    hasErrors() {
        return Object.values(this.errors).some(e => e.length > 0);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event).filter(fn => fn !== callback);
            this.listeners.set(event, listeners);
        }
    }

    emit(event, data = {}) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(fn => fn(data));
        }
    }

    destroy() {
        if (this.validator) {
            this.validator.destroy();
        }
        this.listeners.clear();
        this.errors = {};
        this.touched.clear();
    }
}

/**
 * Helper to create validation props for input elements
 */
export function createFieldProps(validator, field, options = {}) {
    const mode = options.mode || 'blur';
    const props = {
        name: field,
        'aria-invalid': validator.hasError(field) ? 'true' : undefined,
        'aria-describedby': validator.hasError(field) ? `${field}-error` : undefined,
    };

    if (mode === 'blur' || mode === 'both') {
        props.onBlur = async (e) => {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            await validator.validateField(field, value, options.getData?.() || {});
            options.onBlur?.(e);
        };
    }

    if (mode === 'change' || mode === 'both') {
        props.onChange = async (e) => {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            await validator.validateField(field, value, options.getData?.() || {});
            options.onChange?.(e);
        };
    }

    return props;
}

/**
 * Error display helper
 */
export function getErrorProps(validator, field) {
    const error = validator.getError(field);
    return {
        id: `${field}-error`,
        role: 'alert',
        'aria-live': 'polite',
        children: error,
        style: { display: error ? 'block' : 'none' },
    };
}

export default {
    useValidation,
    createReactValidator,
    ReactValidator,
    createFieldProps,
    getErrorProps,
};
