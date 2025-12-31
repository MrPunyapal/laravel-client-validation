import { describe, it, expect, beforeEach } from 'vitest';
import LaravelValidator from '../../resources/js/core/LaravelValidator.js';

describe('LaravelValidator', () => {
    let validator;

    beforeEach(() => {
        validator = new LaravelValidator({
            rules: {
                name: 'required|min:2|max:50',
                email: 'required|email',
                age: 'numeric|min:18',
                password: 'required|min:8|confirmed',
                terms: 'accepted'
            },
            messages: {
                'name.required': 'Please enter your name',
                'email.email': 'Please enter a valid email'
            },
            attributes: {
                name: 'Full Name',
                email: 'Email Address'
            }
        });
    });

    describe('constructor', () => {
        it('normalizes string rules to array', () => {
            expect(validator.rules.name).toEqual(['required', 'min:2', 'max:50']);
            expect(validator.rules.email).toEqual(['required', 'email']);
        });

        it('accepts default options', () => {
            expect(validator.options.debounce).toBe(300);
            expect(validator.options.stopOnFirstError).toBe(true);
        });

        it('initializes empty state', () => {
            expect(validator.errors).toEqual({});
            expect(validator.touched.size).toBe(0);
            expect(validator.validating.size).toBe(0);
        });
    });

    describe('parseRule', () => {
        it('parses rule without parameters', () => {
            const result = validator.parseRule('required');
            expect(result).toEqual({ name: 'required', params: [] });
        });

        it('parses rule with single parameter', () => {
            const result = validator.parseRule('min:8');
            expect(result).toEqual({ name: 'min', params: ['8'] });
        });

        it('parses rule with multiple parameters', () => {
            const result = validator.parseRule('between:1,100');
            expect(result).toEqual({ name: 'between', params: ['1', '100'] });
        });
    });

    describe('validateField', () => {
        it('validates required field with empty value', async () => {
            const result = await validator.validateField('name', '');
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('validates required field with valid value', async () => {
            const result = await validator.validateField('name', 'John Doe');
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('validates email format', async () => {
            const invalid = await validator.validateField('email', 'invalid-email');
            expect(invalid.valid).toBe(false);

            const valid = await validator.validateField('email', 'test@example.com');
            expect(valid.valid).toBe(true);
        });

        it('validates min length for strings', async () => {
            const invalid = await validator.validateField('name', 'A');
            expect(invalid.valid).toBe(false);

            const valid = await validator.validateField('name', 'AB');
            expect(valid.valid).toBe(true);
        });

        it('validates max length for strings', async () => {
            const longName = 'A'.repeat(51);
            const result = await validator.validateField('name', longName);
            expect(result.valid).toBe(false);
        });

        it('marks field as touched after validation', async () => {
            expect(validator.isTouched('name')).toBe(false);
            await validator.validateField('name', 'John');
            expect(validator.isTouched('name')).toBe(true);
        });

        it('updates errors state', async () => {
            await validator.validateField('name', '');
            expect(validator.hasError('name')).toBe(true);

            await validator.validateField('name', 'Valid Name');
            expect(validator.hasError('name')).toBe(false);
        });

        it('validates confirmed rule with matching confirmation', async () => {
            const data = { password: 'secret123', password_confirmation: 'secret123' };
            const result = await validator.validateField('password', 'secret123', data);
            expect(result.valid).toBe(true);
        });

        it('validates confirmed rule with non-matching confirmation', async () => {
            const data = { password: 'secret123', password_confirmation: 'different' };
            const result = await validator.validateField('password', 'secret123', data);
            expect(result.valid).toBe(false);
        });

        it('skips validation for fields without rules', async () => {
            const result = await validator.validateField('unknown', 'any value');
            expect(result.valid).toBe(true);
        });
    });

    describe('validateAll', () => {
        it('validates all fields and returns combined result', async () => {
            const result = await validator.validateAll({
                name: 'John',
                email: 'john@example.com',
                age: '25',
                password: 'secret123',
                password_confirmation: 'secret123',
                terms: true
            });

            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('returns invalid when any field fails', async () => {
            const result = await validator.validateAll({
                name: '',
                email: 'invalid',
                age: '10',
                password: 'short',
                password_confirmation: 'short',
                terms: false
            });

            expect(result.valid).toBe(false);
            expect(Object.keys(result.errors).length).toBeGreaterThan(0);
        });
    });

    describe('formatMessage', () => {
        it('uses custom message when provided', () => {
            const message = validator.formatMessage('name', 'required', []);
            expect(message).toBe('Please enter your name');
        });

        it('replaces :attribute placeholder', () => {
            const message = validator.formatMessage('email', 'required', []);
            expect(message).toContain('Email Address');
        });

        it('replaces :min placeholder', () => {
            const message = validator.formatMessage('name', 'min', ['5']);
            expect(message).toContain('5');
        });
    });

    describe('state methods', () => {
        it('getErrors returns empty array for valid field', () => {
            expect(validator.getErrors('name')).toEqual([]);
        });

        it('getError returns null for valid field', () => {
            expect(validator.getError('name')).toBe(null);
        });

        it('hasErrors returns false initially', () => {
            expect(validator.hasErrors()).toBe(false);
        });

        it('isValidating returns false when not validating', () => {
            expect(validator.isValidating()).toBe(false);
            expect(validator.isValidating('name')).toBe(false);
        });

        it('clearErrors clears specific field', async () => {
            await validator.validateField('name', '');
            expect(validator.hasError('name')).toBe(true);

            validator.clearErrors('name');
            expect(validator.hasError('name')).toBe(false);
        });

        it('clearErrors clears all fields', async () => {
            await validator.validateField('name', '');
            await validator.validateField('email', '');

            validator.clearErrors();
            expect(validator.hasErrors()).toBe(false);
            expect(validator.touched.size).toBe(0);
        });

        it('reset clears all state', async () => {
            await validator.validateField('name', '');

            validator.reset();
            expect(validator.errors).toEqual({});
            expect(validator.touched.size).toBe(0);
            expect(validator.validating.size).toBe(0);
        });
    });

    describe('rule management', () => {
        it('setRules adds new rules', () => {
            validator.setRules({ phone: 'required|numeric' });
            expect(validator.rules.phone).toEqual(['required', 'numeric']);
        });

        it('setMessages adds new messages', () => {
            validator.setMessages({ 'phone.required': 'Phone is required' });
            expect(validator.messages['phone.required']).toBe('Phone is required');
        });

        it('setAttributes adds new attributes', () => {
            validator.setAttributes({ phone: 'Phone Number' });
            expect(validator.attributes.phone).toBe('Phone Number');
        });
    });

    describe('event hooks', () => {
        it('calls beforeFieldValidate hook', async () => {
            let hookCalled = false;
            validator.beforeFieldValidate(() => {
                hookCalled = true;
            });

            await validator.validateField('name', 'John');
            expect(hookCalled).toBe(true);
        });

        it('calls afterFieldValidate hook', async () => {
            let hookData = null;
            validator.afterFieldValidate((data) => {
                hookData = data;
            });

            await validator.validateField('name', 'John');
            expect(hookData).not.toBe(null);
            expect(hookData.field).toBe('name');
            expect(hookData.valid).toBe(true);
        });
    });

    describe('hasRule', () => {
        it('returns true for existing rule', () => {
            expect(validator.hasRule('name', 'required')).toBe(true);
            expect(validator.hasRule('email', 'email')).toBe(true);
        });

        it('returns false for non-existing rule', () => {
            expect(validator.hasRule('name', 'email')).toBe(false);
        });
    });

    describe('isEmpty', () => {
        it('returns true for null', () => {
            expect(validator.isEmpty(null)).toBe(true);
        });

        it('returns true for undefined', () => {
            expect(validator.isEmpty(undefined)).toBe(true);
        });

        it('returns true for empty string', () => {
            expect(validator.isEmpty('')).toBe(true);
            expect(validator.isEmpty('   ')).toBe(true);
        });

        it('returns true for empty array', () => {
            expect(validator.isEmpty([])).toBe(true);
        });

        it('returns false for non-empty values', () => {
            expect(validator.isEmpty('hello')).toBe(false);
            expect(validator.isEmpty(['item'])).toBe(false);
            expect(validator.isEmpty(0)).toBe(false);
        });
    });
});
