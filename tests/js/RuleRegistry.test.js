import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the validationRules import
vi.mock('../../resources/js/core/rules/index.js', () => ({
    default: {
        required: (value) => value !== '' && value !== null && value !== undefined,
        email: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        min: (value, [min]) => !value || value.length >= Number(min),
        max: (value, [max]) => !value || value.length <= Number(max),
    }
}));

// Import after mock
const { default: RuleRegistry } = await import('../../resources/js/core/RuleRegistry.js');

describe('RuleRegistry', () => {
    describe('has', () => {
        it('returns true for built-in rules', () => {
            expect(RuleRegistry.has('required')).toBe(true);
            expect(RuleRegistry.has('email')).toBe(true);
        });

        it('returns false for unknown rules', () => {
            expect(RuleRegistry.has('unknown_rule')).toBe(false);
        });

        it('returns true for custom rules after extending', () => {
            RuleRegistry.extend('custom', () => true);
            expect(RuleRegistry.has('custom')).toBe(true);
        });
    });

    describe('get', () => {
        it('returns validator function for built-in rules', () => {
            const required = RuleRegistry.get('required');
            expect(typeof required).toBe('function');
        });

        it('returns undefined for unknown rules', () => {
            expect(RuleRegistry.get('nonexistent')).toBe(undefined);
        });

        it('custom rules take precedence over built-in', () => {
            const customValidator = () => 'custom';
            RuleRegistry.extend('required', customValidator);
            expect(RuleRegistry.get('required')()).toBe('custom');
        });
    });

    describe('isRemote', () => {
        it('returns true for remote rules', () => {
            expect(RuleRegistry.isRemote('unique')).toBe(true);
            expect(RuleRegistry.isRemote('exists')).toBe(true);
            expect(RuleRegistry.isRemote('password')).toBe(true);
            expect(RuleRegistry.isRemote('current_password')).toBe(true);
        });

        it('returns false for client rules', () => {
            expect(RuleRegistry.isRemote('required')).toBe(false);
            expect(RuleRegistry.isRemote('email')).toBe(false);
        });
    });

    describe('extend', () => {
        it('adds custom rule', () => {
            const validator = (value) => value === 'valid';
            RuleRegistry.extend('my_rule', validator);

            expect(RuleRegistry.has('my_rule')).toBe(true);
            expect(RuleRegistry.get('my_rule')('valid')).toBe(true);
            expect(RuleRegistry.get('my_rule')('invalid')).toBe(false);
        });

        it('adds custom message with rule', () => {
            RuleRegistry.extend('my_rule2', () => true, 'Custom message');
            expect(RuleRegistry.getMessage('my_rule2')).toBe('Custom message');
        });
    });

    describe('registerRemote', () => {
        it('adds rule to remote set', () => {
            expect(RuleRegistry.isRemote('custom_remote')).toBe(false);
            RuleRegistry.registerRemote('custom_remote');
            expect(RuleRegistry.isRemote('custom_remote')).toBe(true);
        });
    });

    describe('getMessage', () => {
        it('returns default message for known rules', () => {
            expect(RuleRegistry.getMessage('required')).toBe('The :attribute field is required.');
            expect(RuleRegistry.getMessage('email')).toBe('The :attribute must be a valid email address.');
        });

        it('returns generic message for unknown rules', () => {
            expect(RuleRegistry.getMessage('unknown')).toBe('The :attribute is invalid.');
        });
    });

    describe('getAvailableRules', () => {
        it('returns array of all available rules', () => {
            const rules = RuleRegistry.getAvailableRules();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules).toContain('required');
            expect(rules).toContain('email');
        });
    });
});
