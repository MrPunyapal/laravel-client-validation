import { describe, it, expect, vi, beforeEach } from 'vitest';
import RemoteValidator from '../../resources/js/core/RemoteValidator.js';
import { LaravelValidator, RuleRegistry, EventEmitter } from '../../resources/js/core/index.js';

describe('Core Entry Point', () => {
    it('exports LaravelValidator', () => {
        expect(LaravelValidator).toBeDefined();
        expect(typeof LaravelValidator).toBe('function');
    });

    it('exports RuleRegistry', () => {
        expect(RuleRegistry).toBeDefined();
        expect(typeof RuleRegistry.has).toBe('function');
    });

    it('exports EventEmitter', () => {
        expect(EventEmitter).toBeDefined();
        expect(typeof EventEmitter).toBe('function');
    });

    it('creates validator from core export', () => {
        const validator = new LaravelValidator({
            rules: { email: 'required|email' }
        });
        expect(validator).toBeDefined();
        expect(validator.rules).toHaveProperty('email');
    });
});

describe('RemoteValidator Backend-Agnostic', () => {
    let remote;

    beforeEach(() => {
        remote = new RemoteValidator();
    });

    it('has CSRF enabled by default', () => {
        expect(remote.options.csrf).toBe(true);
    });

    it('uses X-CSRF-TOKEN as default header name', () => {
        expect(remote.options.csrfHeaderName).toBe('X-CSRF-TOKEN');
    });

    it('can disable CSRF', () => {
        const r = new RemoteValidator({ csrf: false });
        expect(r.options.csrf).toBe(false);
    });

    it('can set custom CSRF header name', () => {
        const r = new RemoteValidator({ csrfHeaderName: 'X-Custom-Token' });
        expect(r.options.csrfHeaderName).toBe('X-Custom-Token');
    });

    it('can set custom CSRF token resolver', () => {
        const resolver = () => 'my-token';
        const r = new RemoteValidator({ csrfTokenResolver: resolver });
        expect(r.getCsrfToken()).toBe('my-token');
    });

    it('setCsrf updates CSRF config fluently', () => {
        const resolver = () => 'fluent-token';
        const result = remote.setCsrf(false, 'X-My-CSRF', resolver);

        expect(result).toBe(remote);
        expect(remote.options.csrf).toBe(false);
        expect(remote.options.csrfHeaderName).toBe('X-My-CSRF');
        expect(remote.getCsrfToken()).toBe('fluent-token');
    });

    it('buildHeaders excludes CSRF when disabled', () => {
        remote.setCsrf(false);
        const headers = remote.buildHeaders();

        expect(headers).not.toHaveProperty('X-CSRF-TOKEN');
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Accept']).toBe('application/json');
    });

    it('buildHeaders includes CSRF when enabled with resolver', () => {
        remote.setCsrf(true, 'X-CSRF-TOKEN', () => 'test-token');
        const headers = remote.buildHeaders();

        expect(headers['X-CSRF-TOKEN']).toBe('test-token');
    });

    it('buildHeaders merges custom headers', () => {
        remote.options.headers = { 'Authorization': 'Bearer xyz' };
        const headers = remote.buildHeaders();

        expect(headers['Authorization']).toBe('Bearer xyz');
        expect(headers['Content-Type']).toBe('application/json');
    });

    it('can use custom adapter for requests', async () => {
        const adapter = vi.fn(async (url, payload, options) => ({
            valid: true,
            message: null,
        }));

        remote.setAdapter(adapter);
        const result = await remote.validate('email', 'test@example.com', 'unique', ['users']);

        expect(adapter).toHaveBeenCalledOnce();
        expect(adapter).toHaveBeenCalledWith(
            '/client-validation/validate',
            expect.objectContaining({ field: 'email', value: 'test@example.com', rule: 'unique' }),
            expect.objectContaining({ timeout: 5000 })
        );
        expect(result.valid).toBe(true);
    });

    it('custom adapter receives proper payload', async () => {
        let capturedPayload;
        const adapter = vi.fn(async (url, payload) => {
            capturedPayload = payload;
            return { valid: false, message: 'Already taken' };
        });

        remote.setAdapter(adapter);
        const result = await remote.validate('email', 'taken@test.com', 'unique', ['users', 'email']);

        expect(capturedPayload.field).toBe('email');
        expect(capturedPayload.value).toBe('taken@test.com');
        expect(capturedPayload.rule).toBe('unique');
        expect(capturedPayload.parameters).toEqual(['users', 'email']);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Already taken');
    });

    it('custom adapter errors return safe fallback', async () => {
        const adapter = vi.fn(async () => {
            throw new Error('Network error');
        });

        remote.setAdapter(adapter);
        const result = await remote.validate('field', 'val', 'rule');

        expect(result.valid).toBe(false);
        expect(result.message).toContain('Could not validate');
    });

    it('setAdapter is fluent', () => {
        const result = remote.setAdapter(() => {});
        expect(result).toBe(remote);
    });

    it('can use custom request formatter', async () => {
        const formatter = vi.fn((field, value, rule, params, context) => ({
            name: field,
            data: value,
            check: rule,
        }));

        const adapter = vi.fn(async (url, payload) => {
            return { valid: payload.check === 'unique' };
        });

        remote.options.requestFormatter = formatter;
        remote.setAdapter(adapter);

        await remote.validate('email', 'test@test.com', 'unique');

        expect(formatter).toHaveBeenCalledOnce();
        expect(adapter).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ name: 'email', data: 'test@test.com', check: 'unique' }),
            expect.any(Object)
        );
    });

    it('can use custom response parser', () => {
        remote.options.responseParser = (data) => ({
            valid: data.ok === true,
            message: data.error || null,
        });

        const parsed = remote.parseResponse({ ok: true, error: null });
        expect(parsed.valid).toBe(true);

        const parsedError = remote.parseResponse({ ok: false, error: 'Invalid' });
        expect(parsedError.valid).toBe(false);
        expect(parsedError.message).toBe('Invalid');
    });

    it('default response parser handles standard format', () => {
        const parsed = remote.parseResponse({ valid: true, message: null });
        expect(parsed.valid).toBe(true);

        const parsedFalse = remote.parseResponse({ valid: false, message: 'Error' });
        expect(parsedFalse.valid).toBe(false);
        expect(parsedFalse.message).toBe('Error');
    });

    it('caching works with custom adapters', async () => {
        let callCount = 0;
        remote.setAdapter(async () => {
            callCount++;
            return { valid: true };
        });

        await remote.validate('email', 'test@test.com', 'unique');
        await remote.validate('email', 'test@test.com', 'unique');

        expect(callCount).toBe(1);
    });

    it('different values bypass cache', async () => {
        let callCount = 0;
        remote.setAdapter(async () => {
            callCount++;
            return { valid: true };
        });

        await remote.validate('email', 'a@test.com', 'unique');
        await remote.validate('email', 'b@test.com', 'unique');

        expect(callCount).toBe(2);
    });

    it('clearCache forces refetch', async () => {
        let callCount = 0;
        remote.setAdapter(async () => {
            callCount++;
            return { valid: true };
        });

        await remote.validate('email', 'test@test.com', 'unique');
        remote.clearCache();
        await remote.validate('email', 'test@test.com', 'unique');

        expect(callCount).toBe(2);
    });

    it('getCsrfToken returns empty string in jsdom without meta', () => {
        const token = remote.getCsrfToken();
        expect(token).toBe('');
    });

    it('getCsrfToken reads from meta tag', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'csrf-token');
        meta.setAttribute('content', 'meta-csrf-token');
        document.head.appendChild(meta);

        const token = remote.getCsrfToken();
        expect(token).toBe('meta-csrf-token');

        document.head.removeChild(meta);
    });

    it('updateOptions merges new options', () => {
        remote.updateOptions({ timeout: 10000, url: '/api/validate' });
        expect(remote.options.timeout).toBe(10000);
        expect(remote.options.url).toBe('/api/validate');
        expect(remote.options.csrf).toBe(true);
    });
});

describe('Non-Laravel Backend Integration', () => {
    it('works with Django-style backend', async () => {
        const remote = new RemoteValidator({
            url: '/api/validate/',
            csrf: true,
            csrfHeaderName: 'X-CSRFToken',
            csrfTokenResolver: () => 'django-csrf-token',
            adapter: async (url, payload) => {
                return { valid: payload.value !== 'taken', message: payload.value === 'taken' ? 'Already exists' : null };
            },
        });

        const valid = await remote.validate('username', 'available', 'unique');
        expect(valid.valid).toBe(true);

        const invalid = await remote.validate('username', 'taken', 'unique');
        expect(invalid.valid).toBe(false);
        expect(invalid.message).toBe('Already exists');
    });

    it('works with Express/Node backend (no CSRF)', async () => {
        const remote = new RemoteValidator({
            url: '/validate',
            csrf: false,
            adapter: async (url, payload) => {
                return { valid: true };
            },
        });

        const headers = remote.buildHeaders();
        expect(headers).not.toHaveProperty('X-CSRF-TOKEN');
        expect(headers).not.toHaveProperty('X-CSRFToken');

        const result = await remote.validate('email', 'test@test.com', 'unique');
        expect(result.valid).toBe(true);
    });

    it('works with custom API format', async () => {
        const remote = new RemoteValidator({
            url: '/api/check',
            csrf: false,
            requestFormatter: (field, value, rule, params) => ({
                checks: [{ type: rule, field, value, options: params }],
            }),
            adapter: async (url, payload) => {
                const check = payload.checks[0];
                return { valid: check.value.includes('@'), message: check.value.includes('@') ? null : 'Invalid format' };
            },
        });

        const valid = await remote.validate('email', 'test@test.com', 'email');
        expect(valid.valid).toBe(true);

        const invalid = await remote.validate('email', 'not-an-email', 'email');
        expect(invalid.valid).toBe(false);
    });
});
