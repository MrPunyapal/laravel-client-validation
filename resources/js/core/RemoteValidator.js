/**
 * Remote Validator - Handles AJAX validation for server-side rules
 *
 * Used for rules like `unique`, `exists` that require database access.
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
        this.cacheMaxAge = 60000; // 1 minute cache
    }

    /**
     * Validate a field with a remote rule
     */
    async validate(field, value, rule, params = [], context = {}) {
        const cacheKey = this.getCacheKey(field, value, rule, params);

        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Check for pending request
        if (this.pending.has(cacheKey)) {
            return this.pending.get(cacheKey);
        }

        // Make the request
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

    /**
     * Make AJAX validation request
     */
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

    /**
     * Get CSRF token from meta tag or cookie
     */
    getCsrfToken() {
        // Try meta tag first
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
            return meta.getAttribute('content');
        }

        // Try Laravel's XSRF-TOKEN cookie
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }

        return '';
    }

    /**
     * Generate cache key
     */
    getCacheKey(field, value, rule, params) {
        return `${field}:${value}:${rule}:${params.join(',')}`;
    }

    /**
     * Get from cache if not expired
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.cacheMaxAge) {
            this.cache.delete(key);
            return null;
        }

        return cached.result;
    }

    /**
     * Set cache entry
     */
    setCache(key, result) {
        this.cache.set(key, {
            result,
            timestamp: Date.now()
        });

        // Limit cache size
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Update options
     */
    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }
}
