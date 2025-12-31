/**
 * Remote Validator - Handles AJAX validation for server-side rules (unique, exists, etc).
 */
export default class RemoteValidator {
    constructor(options = {}) {
        this.options = {
            url: '/client-validation/validate',
            timeout: 5000,
            headers: {},
            ...options
        };

        this.cache = new Map();
        this.pending = new Map();
        this.cacheMaxAge = 60000;
    }

    async validate(field, value, rule, params = [], context = {}) {
        const cacheKey = this.getCacheKey(field, value, rule, params);

        const cached = this.getFromCache(cacheKey);
        if (cached !== null) return cached;

        if (this.pending.has(cacheKey)) return this.pending.get(cacheKey);

        const promise = this.makeRequest(field, value, rule, params, context);
        this.pending.set(cacheKey, promise);

        try {
            const result = await promise;
            this.setCache(cacheKey, result);
            return result;
        } finally {
            this.pending.delete(cacheKey);
        }
    }

    async makeRequest(field, value, rule, params, context) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        try {
            const response = await fetch(this.options.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': this.getCsrfToken(),
                    ...this.options.headers
                },
                body: JSON.stringify({
                    field,
                    value,
                    rule,
                    parameters: params,
                    messages: context.messages || {},
                    attributes: context.attributes || {}
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return {
                valid: data.valid === true,
                message: data.message || null
            };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return {
                    valid: false,
                    message: 'Validation request timed out'
                };
            }

            console.error('Remote validation error:', error);
            return {
                valid: false,
                message: 'Could not validate. Please try again.'
            };
        }
    }

    getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute('content');

        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') return decodeURIComponent(value);
        }
        return '';
    }

    getCacheKey(field, value, rule, params) {
        return `${field}:${value}:${rule}:${params.join(',')}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > this.cacheMaxAge) {
            this.cache.delete(key);
            return null;
        }
        return cached.result;
    }

    setCache(key, result) {
        this.cache.set(key, { result, timestamp: Date.now() });
        if (this.cache.size > 100) {
            this.cache.delete(this.cache.keys().next().value);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }
}
