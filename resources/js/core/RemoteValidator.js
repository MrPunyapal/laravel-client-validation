/**
 * Remote Validator - Handles AJAX validation for server-side rules.
 * Backend-agnostic: works with Laravel out of the box, but supports
 * any backend via configurable adapter, CSRF strategy, and request/response format.
 *
 * @example
 * // Laravel (default)
 * new RemoteValidator({ url: '/client-validation/validate' })
 *
 * // Custom backend
 * new RemoteValidator({
 *     url: '/api/validate',
 *     csrf: false,
 *     adapter: async (url, payload, options) => {
 *         const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
 *         const data = await res.json();
 *         return { valid: data.ok, message: data.error };
 *     }
 * })
 */
export default class RemoteValidator {
    constructor(options = {}) {
        this.options = {
            url: '/client-validation/validate',
            timeout: 5000,
            headers: {},
            csrf: true,
            csrfHeaderName: 'X-CSRF-TOKEN',
            csrfTokenResolver: null,
            adapter: null,
            requestFormatter: null,
            responseParser: null,
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
        const payload = this.formatRequest(field, value, rule, params, context);

        if (typeof this.options.adapter === 'function') {
            return this.executeCustomAdapter(payload, context);
        }

        return this.executeDefaultAdapter(payload);
    }

    formatRequest(field, value, rule, params, context) {
        if (typeof this.options.requestFormatter === 'function') {
            return this.options.requestFormatter(field, value, rule, params, context);
        }

        return {
            field,
            value,
            rule,
            parameters: params,
            messages: context.messages || {},
            attributes: context.attributes || {},
        };
    }

    parseResponse(data) {
        if (typeof this.options.responseParser === 'function') {
            return this.options.responseParser(data);
        }

        return {
            valid: data.valid === true,
            message: data.message || null,
        };
    }

    async executeCustomAdapter(payload, context) {
        try {
            const result = await this.options.adapter(this.options.url, payload, {
                timeout: this.options.timeout,
                headers: this.buildHeaders(),
                context,
            });

            return {
                valid: result?.valid === true,
                message: result?.message || null,
            };
        } catch (error) {
            console.error('Remote validation adapter error:', error);
            return { valid: false, message: 'Could not validate. Please try again.' };
        }
    }

    async executeDefaultAdapter(payload) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        try {
            const response = await fetch(this.options.url, {
                method: 'POST',
                headers: this.buildHeaders(),
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return this.parseResponse(data);
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return { valid: false, message: 'Validation request timed out' };
            }

            console.error('Remote validation error:', error);
            return { valid: false, message: 'Could not validate. Please try again.' };
        }
    }

    buildHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...this.options.headers,
        };

        if (this.options.csrf) {
            const token = this.getCsrfToken();
            if (token) {
                headers[this.options.csrfHeaderName] = token;
            }
        }

        return headers;
    }

    getCsrfToken() {
        if (typeof this.options.csrfTokenResolver === 'function') {
            return this.options.csrfTokenResolver();
        }

        if (typeof document === 'undefined') return '';

        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute('content');

        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') return decodeURIComponent(value);
        }

        return '';
    }

    setAdapter(adapter) {
        this.options.adapter = adapter;
        return this;
    }

    setCsrf(enabled, headerName = null, tokenResolver = null) {
        this.options.csrf = enabled;
        if (headerName) this.options.csrfHeaderName = headerName;
        if (tokenResolver) this.options.csrfTokenResolver = tokenResolver;
        return this;
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
