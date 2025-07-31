/**
 * AJAX Validator for server-side validation rules
 */
class AjaxValidator {
    constructor(options = {}) {
        this.options = {
            ajaxUrl: '/client-validation/validate',
            ajaxTimeout: 5000,
            enableAjax: true,
            ...options
        };

        this.requestCache = new Map();
        this.pendingRequests = new Map();
    }

    async validateRule(field, value, rule, context = {}) {
        if (!this.options.enableAjax) {
            console.warn(`AJAX validation disabled but rule '${rule}' requires server validation`);
            return { valid: true, message: null };
        }

        const cacheKey = this.getCacheKey(field, value, rule);

        // Check cache first
        if (this.requestCache.has(cacheKey)) {
            return this.requestCache.get(cacheKey);
        }

        // Check if there's already a pending request for this validation
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        const requestPromise = this.makeValidationRequest(field, value, rule, context);
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;
            this.requestCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AJAX validation error:', error);
            return {
                valid: false,
                message: 'Validation failed due to network error',
                error: error.message
            };
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    async makeValidationRequest(field, value, rule, context) {
        const [ruleName, ...paramsParts] = rule.split(':');

        const requestData = {
            field,
            value,
            rule: ruleName,
            parameters: paramsParts.length > 0 ? paramsParts[0].split(',') : [],
            messages: context.messages || {},
            attributes: context.attributes || {},
            context: {
                validation_id: context.validationId,
                timestamp: Date.now()
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.ajaxTimeout);

        try {
            const response = await fetch(this.options.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': this.getCsrfToken()
                },
                body: JSON.stringify(requestData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return this.normalizeResponse(result);
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Validation request timed out');
            }
            throw error;
        }
    }

    normalizeResponse(response) {
        // Ensure consistent response format
        if (typeof response === 'boolean') {
            return { valid: response, message: null };
        }

        if (typeof response === 'object') {
            return {
                valid: response.valid !== false,
                message: response.message || response.error || null,
                ...response
            };
        }

        return { valid: false, message: 'Invalid server response' };
    }

    getCacheKey(field, value, rule) {
        return `${field}:${rule}:${JSON.stringify(value)}`;
    }

    getCsrfToken() {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    }

    clearCache(field = null) {
        if (field) {
            // Clear cache for specific field
            for (const key of this.requestCache.keys()) {
                if (key.startsWith(`${field}:`)) {
                    this.requestCache.delete(key);
                }
            }
        } else {
            this.requestCache.clear();
        }
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }

    // Debugging and monitoring
    getStats() {
        return {
            cacheSize: this.requestCache.size,
            pendingRequests: this.pendingRequests.size,
            cacheHitRate: this.calculateCacheHitRate()
        };
    }

    calculateCacheHitRate() {
        // This would require tracking hits/misses
        // Implementation depends on requirements
        return 0;
    }

    // Batch validation for multiple fields
    async validateFields(fields, context = {}) {
        const validationPromises = Object.entries(fields).map(([field, { value, rule }]) =>
            this.validateRule(field, value, rule, context)
        );

        const results = await Promise.all(validationPromises);

        return Object.keys(fields).reduce((acc, field, index) => {
            acc[field] = results[index];
            return acc;
        }, {});
    }

    // Pre-emptive validation for better UX
    prevalidate(field, rule, possibleValues) {
        possibleValues.forEach(value => {
            const cacheKey = this.getCacheKey(field, value, rule);
            if (!this.requestCache.has(cacheKey)) {
                // Fire and forget - populate cache for likely values
                this.validateRule(field, value, rule).catch(() => {
                    // Ignore errors in prevalidation
                });
            }
        });
    }
}

export default AjaxValidator;
