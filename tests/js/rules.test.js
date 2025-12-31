import { describe, it, expect } from 'vitest';

// Import all rules
import required from '../../resources/js/core/rules/required.js';
import email from '../../resources/js/core/rules/email.js';
import min from '../../resources/js/core/rules/min.js';
import max from '../../resources/js/core/rules/max.js';
import numeric from '../../resources/js/core/rules/numeric.js';
import integer from '../../resources/js/core/rules/integer.js';
import alpha from '../../resources/js/core/rules/alpha.js';
import alphaNum from '../../resources/js/core/rules/alpha_num.js';
import alphaDash from '../../resources/js/core/rules/alpha_dash.js';
import url from '../../resources/js/core/rules/url.js';
import between from '../../resources/js/core/rules/between.js';
import confirmed from '../../resources/js/core/rules/confirmed.js';
import size from '../../resources/js/core/rules/size.js';
import inArray from '../../resources/js/core/rules/in.js';
import notIn from '../../resources/js/core/rules/not_in.js';
import boolean from '../../resources/js/core/rules/boolean.js';
import date from '../../resources/js/core/rules/date.js';
import after from '../../resources/js/core/rules/after.js';
import before from '../../resources/js/core/rules/before.js';
import regex from '../../resources/js/core/rules/regex.js';
import same from '../../resources/js/core/rules/same.js';
import different from '../../resources/js/core/rules/different.js';
import accepted from '../../resources/js/core/rules/accepted.js';
import digits from '../../resources/js/core/rules/digits.js';
import digitsBetween from '../../resources/js/core/rules/digits_between.js';
import string from '../../resources/js/core/rules/string.js';
import nullable from '../../resources/js/core/rules/nullable.js';
import array from '../../resources/js/core/rules/array.js';

describe('Validation Rules', () => {
    describe('required', () => {
        it('fails for empty values', () => {
            expect(required('')).toBe(false);
            expect(required(null)).toBe(false);
            expect(required(undefined)).toBe(false);
            expect(required('   ')).toBe(false);
        });

        it('passes for non-empty values', () => {
            expect(required('hello')).toBe(true);
            expect(required(0)).toBe(true);
            expect(required(false)).toBe(true);
            expect(required(['item'])).toBe(true);
        });
    });

    describe('email', () => {
        it('passes for empty values (not required)', () => {
            expect(email('')).toBe(true);
            expect(email(null)).toBe(true);
        });

        it('validates email format', () => {
            expect(email('test@example.com')).toBe(true);
            expect(email('user.name@domain.co.uk')).toBe(true);
            expect(email('invalid')).toBe(false);
            expect(email('invalid@')).toBe(false);
            expect(email('@domain.com')).toBe(false);
        });
    });

    describe('min', () => {
        it('validates string length', () => {
            expect(min('hello', ['5'])).toBe(true);
            expect(min('hi', ['5'])).toBe(false);
            expect(min('hello world', ['5'])).toBe(true);
        });

        it('validates numeric values with numeric rule context', () => {
            const context = { rules: ['numeric'] };
            expect(min('10', ['5'], 'field', context)).toBe(true);
            expect(min('3', ['5'], 'field', context)).toBe(false);
        });

        it('validates array length', () => {
            expect(min([1, 2, 3], ['3'])).toBe(true);
            expect(min([1, 2], ['3'])).toBe(false);
        });

        it('passes for empty values', () => {
            expect(min('', ['5'])).toBe(true);
        });
    });

    describe('max', () => {
        it('validates string length', () => {
            expect(max('hi', ['5'])).toBe(true);
            expect(max('hello', ['5'])).toBe(true);
            expect(max('hello world', ['5'])).toBe(false);
        });

        it('validates numeric values with numeric rule context', () => {
            const context = { rules: ['numeric'] };
            expect(max('5', ['10'], 'field', context)).toBe(true);
            expect(max('15', ['10'], 'field', context)).toBe(false);
        });
    });

    describe('numeric', () => {
        it('validates numeric values', () => {
            expect(numeric('123')).toBe(true);
            expect(numeric('12.34')).toBe(true);
            expect(numeric('-123')).toBe(true);
            expect(numeric('abc')).toBe(false);
            expect(numeric('12abc')).toBe(false);
        });

        it('passes for empty values', () => {
            expect(numeric('')).toBe(true);
        });
    });

    describe('integer', () => {
        it('validates integer values', () => {
            expect(integer('123')).toBe(true);
            expect(integer('-123')).toBe(true);
            expect(integer('12.34')).toBe(false);
            expect(integer('abc')).toBe(false);
        });
    });

    describe('alpha', () => {
        it('validates alphabetic characters only', () => {
            expect(alpha('hello')).toBe(true);
            expect(alpha('Hello')).toBe(true);
            expect(alpha('hello123')).toBe(false);
            expect(alpha('hello world')).toBe(false);
        });
    });

    describe('alpha_num', () => {
        it('validates alphanumeric characters', () => {
            expect(alphaNum('hello123')).toBe(true);
            expect(alphaNum('Hello123')).toBe(true);
            expect(alphaNum('hello-123')).toBe(false);
            expect(alphaNum('hello 123')).toBe(false);
        });
    });

    describe('alpha_dash', () => {
        it('validates alphanumeric with dashes and underscores', () => {
            expect(alphaDash('hello-world')).toBe(true);
            expect(alphaDash('hello_world')).toBe(true);
            expect(alphaDash('hello-world_123')).toBe(true);
            expect(alphaDash('hello world')).toBe(false);
        });
    });

    describe('url', () => {
        it('validates URL format', () => {
            expect(url('https://example.com')).toBe(true);
            expect(url('http://example.com')).toBe(true);
            expect(url('https://example.com/path?query=1')).toBe(true);
            expect(url('not-a-url')).toBe(false);
            expect(url('example.com')).toBe(false);
        });
    });

    describe('between', () => {
        it('validates string length between min and max', () => {
            expect(between('hello', ['3', '10'])).toBe(true);
            expect(between('hi', ['3', '10'])).toBe(false);
            expect(between('hello world!', ['3', '10'])).toBe(false);
        });

        it('validates numeric values between min and max', () => {
            expect(between(5, ['1', '10'])).toBe(true);
            expect(between(0, ['1', '10'])).toBe(false);
            expect(between(15, ['1', '10'])).toBe(false);
        });
    });

    describe('confirmed', () => {
        it('checks confirmation field matches', () => {
            const context = { field: 'password', allData: { password: 'secret', password_confirmation: 'secret' } };
            expect(confirmed('secret', [], 'password', context)).toBe(true);
        });

        it('fails when confirmation does not match', () => {
            const context = { field: 'password', allData: { password: 'secret', password_confirmation: 'different' } };
            expect(confirmed('secret', [], 'password', context)).toBe(false);
        });
    });

    describe('size', () => {
        it('validates exact string length', () => {
            expect(size('hello', ['5'])).toBe(true);
            expect(size('hi', ['5'])).toBe(false);
        });

        it('validates exact array length', () => {
            expect(size([1, 2, 3], ['3'])).toBe(true);
            expect(size([1, 2], ['3'])).toBe(false);
        });
    });

    describe('in', () => {
        it('validates value is in list', () => {
            expect(inArray('active', ['active', 'inactive', 'pending'])).toBe(true);
            expect(inArray('deleted', ['active', 'inactive', 'pending'])).toBe(false);
        });
    });

    describe('not_in', () => {
        it('validates value is not in list', () => {
            expect(notIn('active', ['banned', 'deleted'])).toBe(true);
            expect(notIn('banned', ['banned', 'deleted'])).toBe(false);
        });
    });

    describe('boolean', () => {
        it('validates boolean-like values', () => {
            expect(boolean(true)).toBe(true);
            expect(boolean(false)).toBe(true);
            expect(boolean(1)).toBe(true);
            expect(boolean(0)).toBe(true);
            expect(boolean('1')).toBe(true);
            expect(boolean('0')).toBe(true);
            expect(boolean('true')).toBe(true);
            expect(boolean('false')).toBe(true);
            expect(boolean('yes')).toBe(false);
        });
    });

    describe('date', () => {
        it('validates date format', () => {
            expect(date('2024-01-15')).toBe(true);
            expect(date('January 15, 2024')).toBe(true);
            expect(date('not-a-date')).toBe(false);
        });
    });

    describe('after', () => {
        it('validates date is after given date', () => {
            expect(after('2024-12-31', ['2024-01-01'])).toBe(true);
            expect(after('2024-01-01', ['2024-12-31'])).toBe(false);
        });
    });

    describe('before', () => {
        it('validates date is before given date', () => {
            expect(before('2024-01-01', ['2024-12-31'])).toBe(true);
            expect(before('2024-12-31', ['2024-01-01'])).toBe(false);
        });
    });

    describe('regex', () => {
        it('validates against regex pattern', () => {
            expect(regex('hello123', ['/^[a-z0-9]+$/'])).toBe(true);
            expect(regex('Hello123', ['/^[a-z0-9]+$/'])).toBe(false);
            expect(regex('hello-123', ['/^[a-z0-9]+$/'])).toBe(false);
        });
    });

    describe('same', () => {
        it('validates field matches another field', () => {
            const context = { allData: { password: 'secret', confirm: 'secret' } };
            expect(same('secret', ['password'], 'confirm', context)).toBe(true);
        });

        it('fails when fields do not match', () => {
            const context = { allData: { password: 'secret', confirm: 'different' } };
            expect(same('different', ['password'], 'confirm', context)).toBe(false);
        });
    });

    describe('different', () => {
        it('validates field differs from another field', () => {
            expect(different('value1', ['other'], 'field', { other: 'value2' })).toBe(true);
            expect(different('same', ['other'], 'field', { other: 'same' })).toBe(false);
        });
    });

    describe('accepted', () => {
        it('validates accepted values', () => {
            expect(accepted(true)).toBe(true);
            expect(accepted('yes')).toBe(true);
            expect(accepted('on')).toBe(true);
            expect(accepted(1)).toBe(true);
            expect(accepted('1')).toBe(true);
            expect(accepted(false)).toBe(false);
            expect(accepted('no')).toBe(false);
        });
    });

    describe('digits', () => {
        it('validates exact number of digits', () => {
            expect(digits('12345', ['5'])).toBe(true);
            expect(digits('1234', ['5'])).toBe(false);
            expect(digits('123456', ['5'])).toBe(false);
            expect(digits('12a45', ['5'])).toBe(false);
        });
    });

    describe('digits_between', () => {
        it('validates digits between min and max', () => {
            expect(digitsBetween('123', ['2', '5'])).toBe(true);
            expect(digitsBetween('12345', ['2', '5'])).toBe(true);
            expect(digitsBetween('1', ['2', '5'])).toBe(false);
            expect(digitsBetween('123456', ['2', '5'])).toBe(false);
        });
    });

    describe('string', () => {
        it('validates string type', () => {
            expect(string('hello')).toBe(true);
            expect(string('')).toBe(true);
            expect(string(123)).toBe(false);
            expect(string([])).toBe(false);
        });
    });

    describe('nullable', () => {
        it('always passes (marker rule)', () => {
            expect(nullable('')).toBe(true);
            expect(nullable(null)).toBe(true);
            expect(nullable('value')).toBe(true);
        });
    });

    describe('array', () => {
        it('validates array type', () => {
            expect(array([])).toBe(true);
            expect(array([1, 2, 3])).toBe(true);
            expect(array('not-array')).toBe(false);
            expect(array({})).toBe(false);
        });
    });
});

// New rules tests
import requiredIf from '../../resources/js/core/rules/required_if.js';
import requiredUnless from '../../resources/js/core/rules/required_unless.js';
import requiredWith from '../../resources/js/core/rules/required_with.js';
import requiredWithout from '../../resources/js/core/rules/required_without.js';
import afterOrEqual from '../../resources/js/core/rules/after_or_equal.js';
import beforeOrEqual from '../../resources/js/core/rules/before_or_equal.js';
import multipleOf from '../../resources/js/core/rules/multiple_of.js';
import decimal from '../../resources/js/core/rules/decimal.js';
import distinct from '../../resources/js/core/rules/distinct.js';
import macAddress from '../../resources/js/core/rules/mac_address.js';
import ascii from '../../resources/js/core/rules/ascii.js';
import prohibited from '../../resources/js/core/rules/prohibited.js';
import prohibitedIf from '../../resources/js/core/rules/prohibited_if.js';
import acceptedIf from '../../resources/js/core/rules/accepted_if.js';
import declined from '../../resources/js/core/rules/declined.js';
import declinedIf from '../../resources/js/core/rules/declined_if.js';
import dateEquals from '../../resources/js/core/rules/date_equals.js';
import doesntStartWith from '../../resources/js/core/rules/doesnt_start_with.js';
import doesntEndWith from '../../resources/js/core/rules/doesnt_end_with.js';

describe('New Validation Rules', () => {
    describe('required_if', () => {
        it('requires field when other field matches value', () => {
            const context = { allData: { role: 'admin' } };
            expect(requiredIf('', ['role', 'admin'], 'permissions', context)).toBe(false);
            expect(requiredIf('some-permission', ['role', 'admin'], 'permissions', context)).toBe(true);
        });

        it('does not require when other field does not match', () => {
            const context = { allData: { role: 'user' } };
            expect(requiredIf('', ['role', 'admin'], 'permissions', context)).toBe(true);
        });
    });

    describe('required_unless', () => {
        it('requires field unless other field matches value', () => {
            const context = { allData: { role: 'user' } };
            expect(requiredUnless('', ['role', 'admin'], 'field', context)).toBe(false);
        });

        it('does not require when other field matches', () => {
            const context = { allData: { role: 'admin' } };
            expect(requiredUnless('', ['role', 'admin'], 'field', context)).toBe(true);
        });
    });

    describe('required_with', () => {
        it('requires field when other field is present', () => {
            const context = { allData: { first_name: 'John' } };
            expect(requiredWith('', ['first_name'], 'last_name', context)).toBe(false);
            expect(requiredWith('Doe', ['first_name'], 'last_name', context)).toBe(true);
        });

        it('does not require when other field is empty', () => {
            const context = { allData: { first_name: '' } };
            expect(requiredWith('', ['first_name'], 'last_name', context)).toBe(true);
        });
    });

    describe('required_without', () => {
        it('requires field when other field is absent', () => {
            const context = { allData: { phone: '' } };
            expect(requiredWithout('', ['phone'], 'email', context)).toBe(false);
            expect(requiredWithout('test@test.com', ['phone'], 'email', context)).toBe(true);
        });

        it('does not require when other field is present', () => {
            const context = { allData: { phone: '1234567890' } };
            expect(requiredWithout('', ['phone'], 'email', context)).toBe(true);
        });
    });

    describe('after_or_equal', () => {
        it('validates date is after or equal', () => {
            expect(afterOrEqual('2024-12-31', ['2024-01-01'])).toBe(true);
            expect(afterOrEqual('2024-01-01', ['2024-01-01'])).toBe(true);
            expect(afterOrEqual('2023-12-31', ['2024-01-01'])).toBe(false);
        });
    });

    describe('before_or_equal', () => {
        it('validates date is before or equal', () => {
            expect(beforeOrEqual('2024-01-01', ['2024-12-31'])).toBe(true);
            expect(beforeOrEqual('2024-12-31', ['2024-12-31'])).toBe(true);
            expect(beforeOrEqual('2025-01-01', ['2024-12-31'])).toBe(false);
        });
    });

    describe('multiple_of', () => {
        it('validates value is multiple of divisor', () => {
            expect(multipleOf(10, ['5'])).toBe(true);
            expect(multipleOf(15, ['5'])).toBe(true);
            expect(multipleOf(7, ['5'])).toBe(false);
            expect(multipleOf(0, ['5'])).toBe(true);
        });
    });

    describe('decimal', () => {
        it('validates decimal places', () => {
            expect(decimal('10.50', ['2'])).toBe(true);
            expect(decimal('10.5', ['1'])).toBe(true);
            expect(decimal('10.555', ['2', '4'])).toBe(true);
            expect(decimal('10.5', ['2'])).toBe(false);
        });
    });

    describe('distinct', () => {
        it('validates array has no duplicates', () => {
            expect(distinct([1, 2, 3])).toBe(true);
            expect(distinct([1, 2, 2])).toBe(false);
            expect(distinct(['a', 'b', 'c'])).toBe(true);
            expect(distinct(['a', 'a'])).toBe(false);
        });
    });

    describe('mac_address', () => {
        it('validates MAC address format', () => {
            expect(macAddress('00:1A:2B:3C:4D:5E')).toBe(true);
            expect(macAddress('00-1A-2B-3C-4D-5E')).toBe(true);
            expect(macAddress('001A2B3C4D5E')).toBe(true);
            expect(macAddress('invalid')).toBe(false);
        });
    });

    describe('ascii', () => {
        it('validates ASCII characters only', () => {
            expect(ascii('hello world')).toBe(true);
            expect(ascii('hello123')).toBe(true);
            expect(ascii('héllo')).toBe(false);
            expect(ascii('日本語')).toBe(false);
        });
    });

    describe('prohibited', () => {
        it('always fails', () => {
            expect(prohibited()).toBe(false);
            expect(prohibited('value')).toBe(false);
        });
    });

    describe('prohibited_if', () => {
        it('prohibits field when condition is met', () => {
            const context = { allData: { type: 'guest' } };
            expect(prohibitedIf('some-value', ['type', 'guest'], 'field', context)).toBe(false);
            expect(prohibitedIf('', ['type', 'guest'], 'field', context)).toBe(true);
        });
    });

    describe('accepted_if', () => {
        it('requires acceptance when condition is met', () => {
            const context = { allData: { newsletter: 'yes' } };
            expect(acceptedIf(true, ['newsletter', 'yes'], 'field', context)).toBe(true);
            expect(acceptedIf(false, ['newsletter', 'yes'], 'field', context)).toBe(false);
        });
    });

    describe('declined', () => {
        it('validates declined values', () => {
            expect(declined(false)).toBe(true);
            expect(declined('no')).toBe(true);
            expect(declined('off')).toBe(true);
            expect(declined(0)).toBe(true);
            expect(declined(true)).toBe(false);
        });
    });

    describe('declined_if', () => {
        it('requires decline when condition is met', () => {
            const context = { allData: { unsubscribe: 'yes' } };
            expect(declinedIf(false, ['unsubscribe', 'yes'], 'field', context)).toBe(true);
            expect(declinedIf(true, ['unsubscribe', 'yes'], 'field', context)).toBe(false);
        });
    });

    describe('date_equals', () => {
        it('validates date equals given date', () => {
            expect(dateEquals('2024-01-01', ['2024-01-01'])).toBe(true);
            expect(dateEquals('2024-01-02', ['2024-01-01'])).toBe(false);
        });
    });

    describe('doesnt_start_with', () => {
        it('validates value does not start with prefix', () => {
            expect(doesntStartWith('hello', ['hi', 'hey'])).toBe(true);
            expect(doesntStartWith('hello', ['hel', 'hey'])).toBe(false);
        });
    });

    describe('doesnt_end_with', () => {
        it('validates value does not end with suffix', () => {
            expect(doesntEndWith('hello', ['ing', 'ed'])).toBe(true);
            expect(doesntEndWith('hello', ['lo', 'o'])).toBe(false);
        });
    });
});
