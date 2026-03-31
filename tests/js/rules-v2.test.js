import { describe, it, expect } from 'vitest';

import anyOf from '../../resources/js/core/rules/any_of.js';
import passwordStrength from '../../resources/js/core/rules/password_strength.js';
import boolean from '../../resources/js/core/rules/boolean.js';
import integer from '../../resources/js/core/rules/integer.js';
import numeric from '../../resources/js/core/rules/numeric.js';
import alpha from '../../resources/js/core/rules/alpha.js';
import alphaDash from '../../resources/js/core/rules/alpha_dash.js';
import alphaNum from '../../resources/js/core/rules/alpha_num.js';
import confirmed from '../../resources/js/core/rules/confirmed.js';
import uuid from '../../resources/js/core/rules/uuid.js';

describe('v2 Rule Enhancements', () => {
    describe('boolean:strict', () => {
        it('accepts true and false in strict mode', () => {
            expect(boolean(true, ['strict'])).toBe(true);
            expect(boolean(false, ['strict'])).toBe(true);
        });

        it('rejects non-boolean types in strict mode', () => {
            expect(boolean(1, ['strict'])).toBe(false);
            expect(boolean(0, ['strict'])).toBe(false);
            expect(boolean('1', ['strict'])).toBe(false);
            expect(boolean('true', ['strict'])).toBe(false);
        });

        it('still accepts loose values without strict', () => {
            expect(boolean(1)).toBe(true);
            expect(boolean('1')).toBe(true);
            expect(boolean('true')).toBe(true);
            expect(boolean('on')).toBe(true);
        });
    });

    describe('integer:strict', () => {
        it('accepts integer types in strict mode', () => {
            expect(integer(42, ['strict'])).toBe(true);
            expect(integer(0, ['strict'])).toBe(true);
        });

        it('rejects string integers in strict mode', () => {
            expect(integer('42', ['strict'])).toBe(false);
            expect(integer('0', ['strict'])).toBe(false);
        });

        it('rejects floats in strict mode', () => {
            expect(integer(3.14, ['strict'])).toBe(false);
        });

        it('still accepts string integers without strict', () => {
            expect(integer('42')).toBe(true);
        });
    });

    describe('numeric:strict', () => {
        it('accepts number types in strict mode', () => {
            expect(numeric(42, ['strict'])).toBe(true);
            expect(numeric(3.14, ['strict'])).toBe(true);
        });

        it('rejects string numbers in strict mode', () => {
            expect(numeric('42', ['strict'])).toBe(false);
            expect(numeric('3.14', ['strict'])).toBe(false);
        });

        it('still accepts string numbers without strict', () => {
            expect(numeric('42')).toBe(true);
            expect(numeric('3.14')).toBe(true);
        });
    });

    describe('alpha:ascii', () => {
        it('accepts Unicode letters by default', () => {
            expect(alpha('héllo')).toBe(true);
            expect(alpha('über')).toBe(true);
            expect(alpha('日本語')).toBe(true);
        });

        it('rejects Unicode letters in ascii mode', () => {
            expect(alpha('héllo', ['ascii'])).toBe(false);
            expect(alpha('über', ['ascii'])).toBe(false);
        });

        it('accepts ASCII letters in ascii mode', () => {
            expect(alpha('hello', ['ascii'])).toBe(true);
        });
    });

    describe('alpha_dash:ascii', () => {
        it('accepts Unicode alphanumeric + dash by default', () => {
            expect(alphaDash('héllo-123')).toBe(true);
            expect(alphaDash('über_test')).toBe(true);
        });

        it('rejects Unicode in ascii mode', () => {
            expect(alphaDash('héllo-123', ['ascii'])).toBe(false);
        });

        it('accepts ASCII alpha-dash in ascii mode', () => {
            expect(alphaDash('hello-123_test', ['ascii'])).toBe(true);
        });
    });

    describe('alpha_num:ascii', () => {
        it('accepts Unicode alphanumeric by default', () => {
            expect(alphaNum('héllo123')).toBe(true);
        });

        it('rejects Unicode in ascii mode', () => {
            expect(alphaNum('héllo123', ['ascii'])).toBe(false);
        });

        it('accepts ASCII alphanumeric in ascii mode', () => {
            expect(alphaNum('hello123', ['ascii'])).toBe(true);
        });
    });

    describe('confirmed:custom_field', () => {
        it('matches default confirmation field', () => {
            expect(confirmed('pass', [], 'password', {
                field: 'password',
                allData: { password_confirmation: 'pass' }
            })).toBe(true);
        });

        it('matches custom confirmation field', () => {
            expect(confirmed('test@example.com', ['repeat_email'], 'email', {
                field: 'email',
                allData: { repeat_email: 'test@example.com' }
            })).toBe(true);
        });

        it('fails when custom field does not match', () => {
            expect(confirmed('a@b.com', ['repeat_email'], 'email', {
                field: 'email',
                allData: { repeat_email: 'different@b.com' }
            })).toBe(false);
        });
    });

    describe('uuid:version', () => {
        it('accepts any UUID without version', () => {
            expect(uuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        });

        it('accepts v4 UUID with version param', () => {
            expect(uuid('550e8400-e29b-41d4-a716-446655440000', ['4'])).toBe(true);
        });

        it('rejects non-v4 UUID with v4 version param', () => {
            expect(uuid('550e8400-e29b-11d4-a716-446655440000', ['4'])).toBe(false);
        });

        it('accepts v1 UUID with version param', () => {
            expect(uuid('550e8400-e29b-11d4-a716-446655440000', ['1'])).toBe(true);
        });

        it('passes for empty values', () => {
            expect(uuid('')).toBe(true);
            expect(uuid(null)).toBe(true);
        });
    });
});

describe('New Rules', () => {
    describe('password_strength', () => {
        it('passes with all requirements met', () => {
            expect(passwordStrength('P@ssw0rd!', ['min=8', 'letters', 'mixedCase', 'numbers', 'symbols'])).toBe(true);
        });

        it('fails with short password', () => {
            expect(passwordStrength('P@1a', ['min=8'])).toBe(false);
        });

        it('fails without letters when required', () => {
            expect(passwordStrength('12345678', ['letters'])).toBe(false);
        });

        it('fails without mixed case when required', () => {
            expect(passwordStrength('password1!', ['mixedCase'])).toBe(false);
        });

        it('fails without numbers when required', () => {
            expect(passwordStrength('Password!', ['numbers'])).toBe(false);
        });

        it('fails without symbols when required', () => {
            expect(passwordStrength('Password1', ['symbols'])).toBe(false);
        });

        it('passes for empty values', () => {
            expect(passwordStrength('', ['min=8'])).toBe(true);
            expect(passwordStrength(null, ['min=8'])).toBe(true);
        });
    });

    describe('any_of', () => {
        it('passes for empty values', () => {
            expect(anyOf('', ['email;url'])).toBe(true);
            expect(anyOf(null, ['email;url'])).toBe(true);
        });
    });
});
