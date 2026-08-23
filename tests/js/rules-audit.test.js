import { describe, it, expect } from 'vitest';

import LaravelValidator from '../../resources/js/core/LaravelValidator.js';
import rulesIndex from '../../resources/js/core/rules/index.js';
import registry from '../../resources/js/core/RuleRegistry.js';

import required from '../../resources/js/core/rules/required.js';
import digits from '../../resources/js/core/rules/digits.js';
import digitsBetween from '../../resources/js/core/rules/digits_between.js';
import minDigits from '../../resources/js/core/rules/min_digits.js';
import maxDigits from '../../resources/js/core/rules/max_digits.js';
import integer from '../../resources/js/core/rules/integer.js';
import decimal from '../../resources/js/core/rules/decimal.js';
import date from '../../resources/js/core/rules/date.js';
import after from '../../resources/js/core/rules/after.js';
import before from '../../resources/js/core/rules/before.js';
import afterOrEqual from '../../resources/js/core/rules/after_or_equal.js';
import beforeOrEqual from '../../resources/js/core/rules/before_or_equal.js';
import dateEquals from '../../resources/js/core/rules/date_equals.js';
import dateFormat from '../../resources/js/core/rules/date_format.js';
import regex from '../../resources/js/core/rules/regex.js';
import notRegex from '../../resources/js/core/rules/not_regex.js';
import inRule from '../../resources/js/core/rules/in.js';
import notIn from '../../resources/js/core/rules/not_in.js';
import enumRule from '../../resources/js/core/rules/enum.js';
import alpha from '../../resources/js/core/rules/alpha.js';
import alphaNum from '../../resources/js/core/rules/alpha_num.js';
import alphaDash from '../../resources/js/core/rules/alpha_dash.js';
import boolean from '../../resources/js/core/rules/boolean.js';
import size from '../../resources/js/core/rules/size.js';
import min from '../../resources/js/core/rules/min.js';
import max from '../../resources/js/core/rules/max.js';
import between from '../../resources/js/core/rules/between.js';
import gt from '../../resources/js/core/rules/gt.js';
import gte from '../../resources/js/core/rules/gte.js';
import lt from '../../resources/js/core/rules/lt.js';
import lte from '../../resources/js/core/rules/lte.js';
import same from '../../resources/js/core/rules/same.js';
import different from '../../resources/js/core/rules/different.js';
import contains from '../../resources/js/core/rules/contains.js';
import doesntContain from '../../resources/js/core/rules/doesnt_contain.js';
import startsWith from '../../resources/js/core/rules/starts_with.js';
import endsWith from '../../resources/js/core/rules/ends_with.js';
import doesntStartWith from '../../resources/js/core/rules/doesnt_start_with.js';
import doesntEndWith from '../../resources/js/core/rules/doesnt_end_with.js';
import multipleOf from '../../resources/js/core/rules/multiple_of.js';
import requiredIf from '../../resources/js/core/rules/required_if.js';
import requiredUnless from '../../resources/js/core/rules/required_unless.js';
import requiredWith from '../../resources/js/core/rules/required_with.js';
import requiredWithout from '../../resources/js/core/rules/required_without.js';
import acceptedIf from '../../resources/js/core/rules/accepted_if.js';
import declinedIf from '../../resources/js/core/rules/declined_if.js';
import missingIf from '../../resources/js/core/rules/missing_if.js';
import missingWith from '../../resources/js/core/rules/missing_with.js';
import presentIf from '../../resources/js/core/rules/present_if.js';
import presentWith from '../../resources/js/core/rules/present_with.js';
import prohibitedIf from '../../resources/js/core/rules/prohibited_if.js';
import prohibits from '../../resources/js/core/rules/prohibits.js';
import mimes from '../../resources/js/core/rules/mimes.js';
import mimetypes from '../../resources/js/core/rules/mimetypes.js';
import extensions from '../../resources/js/core/rules/extensions.js';
import minDigitsRule from '../../resources/js/core/rules/min_digits.js';
import maxDigitsRule from '../../resources/js/core/rules/max_digits.js';
import inArrayField from '../../resources/js/core/rules/in_array.js';
import inArrayKeys from '../../resources/js/core/rules/in_array_keys.js';

// Replicates LaravelValidator.parseRule exactly, so tests exercise the same
// parameter fragmentation production code produces.
function parseRule(rule) {
    const [name, ...paramsParts] = rule.split(':');
    const params = paramsParts.length > 0 ? paramsParts[0].split(',') : [];
    return { name, params };
}

// Local calendar helpers (keyword dates resolve to local midnight).
function localDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d;
}
function pad(n) {
    return String(n).padStart(2, '0');
}
// "YYYY-MM-DD HH:MM" in local time (no TZ marker -> parsed as local by V8).
function localDateTime(offsetDays, hours = 12) {
    const d = localDate(offsetDays);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(hours)}:00`;
}

describe('Rules audit - required variants (Laravel empty semantics)', () => {
    it('does not treat "0", 0 or false as empty', () => {
        expect(required('0')).toBe(true);
        expect(required(0)).toBe(true);
        expect(required(false)).toBe(true);
    });

    it('treats null, undefined, "" and [] as empty', () => {
        expect(required(null)).toBe(false);
        expect(required(undefined)).toBe(false);
        expect(required('')).toBe(false);
        expect(required('   ')).toBe(false);
        expect(required([])).toBe(false);
    });
});

describe('Rules audit - digits family must not strip non-digits', () => {
    it('digits rejects values containing non-digit characters', () => {
        // Regression: implementation used to strip non-digits, so
        // digits('12a45') == ['4'] passed because "1245" has 4 chars.
        expect(digits('12a45', ['4'])).toBe(false);
        expect(digits('12a45', ['5'])).toBe(false);
        expect(digits('abc', ['3'])).toBe(false);
    });

    it('digits accepts exact-length digit strings and numeric input', () => {
        expect(digits('12345', ['5'])).toBe(true);
        expect(digits('1234', ['5'])).toBe(false);
        // Laravel is_numeric allows numbers; String coercion keeps parity.
        expect(digits(12345, ['5'])).toBe(true);
    });

    it('digits_between rejects non-digit characters', () => {
        expect(digitsBetween('12ab34', ['4', '6'])).toBe(false);
        expect(digitsBetween('123456', ['4', '6'])).toBe(true);
        expect(digitsBetween(123456, ['4', '6'])).toBe(true);
    });

    it('min_digits / max_digits reject non-digit characters', () => {
        expect(minDigits('12a34567', ['5'])).toBe(false);
        expect(minDigits('12345', ['5'])).toBe(true);
        expect(maxDigits('1234567a', ['5'])).toBe(false);
        expect(maxDigits('12345', ['5'])).toBe(true);
    });
});

describe('Rules audit - integer matches FILTER_VALIDATE_INT semantics', () => {
    it('rejects decimal notation even when numerically integral', () => {
        expect(integer('5.0')).toBe(false);
        expect(integer('5.5')).toBe(false);
    });

    it('accepts signed and zero-padded digit strings', () => {
        expect(integer('+5')).toBe(true);
        expect(integer('-5')).toBe(true);
        expect(integer('05')).toBe(true);
        expect(integer('42')).toBe(true);
        expect(integer(42)).toBe(true);
        expect(integer(0)).toBe(true);
    });

    it('rejects booleans and other types', () => {
        // Regression: Number(true) === 1 used to make integer(true) pass.
        expect(integer(true)).toBe(false);
        expect(integer(null)).toBe(true); // emptiness handled by required
    });
});

describe('Rules audit - decimal follows the Laravel pattern', () => {
    it('accepts integers when min <= total digits <= max (Laravel quirk)', () => {
        // Regression: old implementation demanded a dot for every range.
        expect(decimal('10', ['2', '4'])).toBe(true);
        expect(decimal('1', ['2', '4'])).toBe(false);
    });

    it('accepts an explicit plus sign like Laravel', () => {
        expect(decimal('+10.55', ['2', '2'])).toBe(true);
    });

    it('keeps documented single-parameter and range behaviour', () => {
        expect(decimal('10.50', ['2'])).toBe(true);
        expect(decimal('10.5', ['2'])).toBe(false);
        expect(decimal('10.555', ['2', '4'])).toBe(true);
        expect(decimal('10.5', ['2', '4'])).toBe(false); // 1 place < min 2
        expect(decimal('10.5555', ['2', '4'])).toBe(true);
        expect(decimal('10.55555', ['2', '4'])).toBe(false);
    });

    it('fails closed on non-numeric junk', () => {
        expect(decimal('abc', ['2', '4'])).toBe(false);
        expect(decimal(false, [])).toBe(false);
        expect(decimal('', ['2', '4'])).toBe(true); // emptiness handled by required
    });
});

describe('Rules audit - date rule type strictness', () => {
    it('rejects numbers and booleans that JS Date would silently accept', () => {
        // Regression: !value short-circuit + new Date(number) made these pass.
        expect(date(0)).toBe(false);
        expect(date(1704067200000)).toBe(false);
        expect(date(true)).toBe(false);
        expect(date({})).toBe(false);
    });

    it('accepts valid strings and Date instances', () => {
        expect(date('2024-01-02')).toBe(true);
        expect(date(new Date())).toBe(true);
        expect(new Date('not a date').toString()).toContain('Invalid');
        expect(date('not a date')).toBe(false);
    });
});

describe('Rules audit - date keywords and field references', () => {
    it('after supports today/tomorrow/yesterday keywords', () => {
        expect(after(localDateTime(2), ['tomorrow'])).toBe(true);
        expect(after(localDateTime(-2), ['today'])).toBe(false);
        expect(before(localDateTime(-2), ['yesterday'])).toBe(true);
        expect(before(localDateTime(0), ['yesterday'])).toBe(false);
    });

    it('after/before resolve another field value via context.allData', () => {
        const ctx = { allData: { end_date: '2024-06-10' } };
        expect(after('2024-06-11', ['end_date'], 'start_date', ctx)).toBe(true);
        expect(after('2024-06-09', ['end_date'], 'start_date', ctx)).toBe(false);
        expect(before('2024-06-09', ['end_date'], 'start_date', ctx)).toBe(true);
    });

    it('*_or_equal and date_equals support keywords', () => {
        expect(afterOrEqual(localDateTime(1), ['tomorrow'])).toBe(true);
        expect(afterOrEqual(localDateTime(-1), ['tomorrow'])).toBe(false);
        expect(beforeOrEqual(localDateTime(-1), ['yesterday'])).toBe(true);
        expect(dateEquals(localDateTime(0, 0), ['today'])).toBe(true);
    });

    it('date_equals still compares plain dates day-by-day', () => {
        expect(dateEquals('2024-01-01', ['2024-01-01'])).toBe(true);
        expect(dateEquals('2024-01-02', ['2024-01-01'])).toBe(false);
    });

    it('returns false when the referenced field exists but is empty', () => {
        expect(afterOrEqual('2024-01-01', ['end_date'], 'f', { allData: { end_date: '' } })).toBe(false);
    });
});

describe('Rules audit - date_format multi-format support', () => {
    it('passes when any comma-separated format matches', () => {
        expect(dateFormat('14:30', ['H:i', 'Y-m-d'])).toBe(true);
        expect(dateFormat('2024-05-01', ['H:i', 'Y-m-d'])).toBe(true);
        expect(dateFormat('nope', ['H:i', 'Y-m-d'])).toBe(false);
    });
});

describe('Rules audit - regex survives comma-splitting of parameters', () => {
    it('handles patterns containing commas arriving pre-split', () => {
        // parseRule fragments this into ['/^\d{1', '3}(,', '\d{3})*$/']
        const { params } = parseRule('regex:/^\\d{1,3}(,\\d{3})*$/');
        expect(params.length).toBeGreaterThan(1);
        expect(regex('1,234', params)).toBe(true);
        expect(regex('12,34', params)).toBe(false);

        const nr = parseRule('not_regex:/^\\d{1,3}(,\\d{3})*$/');
        expect(notRegex('12,34', nr.params)).toBe(true);
    });

    it('still honours delimited patterns and explicit flags tokens', () => {
        expect(regex('hello123', ['/^[a-z0-9]+$/'])).toBe(true);
        expect(regex('ABC', ['^abc$', 'i'])).toBe(true);
        expect(regex('ABCX', ['^abc$', 'i'])).toBe(false);
        expect(notRegex('hello123', ['/^[a-z]+$/'])).toBe(true);
        expect(notRegex('hello', ['/^[a-z]+$/'])).toBe(false);
    });

    it('validates through the full parser without breaking on commas', async () => {
        const validator = new LaravelValidator({
            rules: { amount: 'required|regex:/^\\d{1,3}(,\\d{3})*$/' },
            enableAjax: false,
        });
        const good = await validator.validateField('amount', '1,234', {});
        const bad = await validator.validateField('amount', '12,34', {});
        expect(good.valid).toBe(true);
        expect(bad.valid).toBe(false);
    });
});

describe('Rules audit - membership rules stop blanket-passing false', () => {
    it('enum only exempts null/undefined/"" ', () => {
        // Regression: !value made every falsy-but-not-zero value pass.
        expect(enumRule(false, ['true'])).toBe(false);
        expect(enumRule(false, ['false'])).toBe(true);
        expect(enumRule('', ['active'])).toBe(true);
        expect(enumRule(null, ['active'])).toBe(true);
        expect(enumRule(0, ['0', '1'])).toBe(true);
        expect(enumRule(1, ['1', '2'])).toBe(true);
    });

    it('in/not_in compare false against the list like any other value', () => {
        expect(inRule(false, ['false'])).toBe(true);
        expect(inRule(false, ['a', 'b'])).toBe(false);
        expect(notIn(false, ['false'])).toBe(false);
        expect(notIn(false, ['a', 'b'])).toBe(true);
    });
});

describe('Rules audit - alpha family unicode defaults', () => {
    it('allows unicode letters unless the ascii variant is requested', () => {
        expect(alpha('héllo')).toBe(true);
        expect(alpha('日本語')).toBe(true);
        expect(alpha('abc1')).toBe(false);
        expect(alpha('héllo', ['ascii'])).toBe(false);
        expect(alpha('hello', ['ascii'])).toBe(true);

        expect(alphaNum('日本語1')).toBe(true);
        expect(alphaNum('héllo1', ['ascii'])).toBe(false);

        expect(alphaDash('foo-bar_baz')).toBe(true);
        expect(alphaDash('héllo', ['ascii'])).toBe(false);
        expect(alphaDash('foo bar')).toBe(false);
    });
});

describe('Rules audit - boolean core acceptance list', () => {
    it('accepts true, false, 1, 0, "1", "0"', () => {
        for (const v of [true, false, 1, 0, '1', '0']) {
            expect(boolean(v)).toBe(true);
        }
        expect(boolean('yes')).toBe(false);
        expect(boolean('2')).toBe(false);
    });

    it('documents the package extension values', () => {
        // Beyond Laravel's list, this package also accepts string forms
        // useful for HTML checkboxes and JSON APIs.
        expect(boolean('true')).toBe(true);
        expect(boolean('on')).toBe(true);
    });
});

describe('Rules audit - numeric context for size-family rules', () => {
    it('between compares numerically when numeric/integer rule present', () => {
        expect(between('50', ['10', '100'], 'f', { rules: ['numeric'] })).toBe(true);
        expect(between('150', ['10', '100'], 'f', { rules: ['numeric'] })).toBe(false);
        expect(between('50', ['10', '100'], 'f', { rules: ['integer'] })).toBe(true);
    });

    it('size compares numerically with a numeric rule, by length otherwise', () => {
        expect(size('150', ['150'], 'f', { rules: ['integer'] })).toBe(true);
        expect(size('150', ['150'])).toBe(false); // length 3 !== 150
        expect(size('hello', ['5'])).toBe(true);
    });

    it('min/max honour the integer rule as a numeric indicator too', () => {
        expect(min('3', ['5'], 'f', { rules: ['integer'] })).toBe(false);
        expect(max('15', ['10'], 'f', { rules: ['integer'] })).toBe(false);
        // Without numeric context, strings compare by length.
        expect(min('hi', ['5'])).toBe(false);
    });

    it('file sizes compare as raw KB division (no rounding)', () => {
        const file2048 = new File([new Uint8Array(2048)], 'a.png');
        const file2049 = new File([new Uint8Array(2049)], 'b.png');
        expect(size(file2048, ['2'])).toBe(true);
        // Regression: Math.round() used to make a 2049-byte file pass size:2.
        expect(size(file2049, ['2'])).toBe(false);
        expect(min(file2049, ['2'])).toBe(true);
        expect(max(file2048, ['2'])).toBe(true);
    });
});

describe('Rules audit - gt/gte/lt/lte coerce numeric strings', () => {
    it('compares numeric strings numerically, not lexically', () => {
        const ctx = { allData: { qty: '9' } };
        expect(gt('10', ['qty'], 'f', ctx)).toBe(true);
        expect(gte('9', ['qty'], 'f', ctx)).toBe(true);
        expect(lt('8', ['qty'], 'f', ctx)).toBe(true);
        expect(lte('9', ['qty'], 'f', ctx)).toBe(true);
        expect(gt('7', ['qty'], 'f', ctx)).toBe(false);
    });

    it('falls back to length/count comparison for matching types', () => {
        expect(gt('abcdef', ['other'], 'f', { allData: { other: 'abc' } })).toBe(true);
        expect(lt([1], ['other'], 'f', { allData: { other: [1, 2] } })).toBe(true);
        expect(gte([1, 2], ['other'], 'f', { allData: { other: [1, 2] } })).toBe(true);
    });
});

describe('Rules audit - same/different parameter guards', () => {
    it('compare against the sibling field', () => {
        const ctx = { allData: { email_confirmation: 'a@b.co' } };
        expect(same('a@b.co', ['email_confirmation'], 'email', ctx)).toBe(true);
        expect(different('x@y.co', ['email_confirmation'], 'email', ctx)).toBe(true);
    });
});

describe('Rules audit - contains / prefix-suffix guards', () => {
    it('contains requires array value and listed params', () => {
        expect(contains(['a', 'b'], ['a'])).toBe(true);
        expect(contains(['a'], ['b'])).toBe(false);
        expect(contains('abc', ['a'])).toBe(false);
    });

    it('prefix/suffix rules handle missing params without throwing', () => {
        expect(startsWith('hello')).toBe(false);
        expect(startsWith('hello', ['he'])).toBe(true);
        expect(endsWith('hello', ['lo'])).toBe(true);
        expect(doesntStartWith('hello')).toBe(true);
        expect(doesntEndWith('hello', ['lo'])).toBe(false);
    });
});

describe('Rules audit - conditional rules never throw on missing params', () => {
    const noThrowCases = [
        ['same', same],
        ['different', different],
        ['gt', gt],
        ['gte', gte],
        ['lt', lt],
        ['lte', lte],
        ['multiple_of', multipleOf],
        ['in', inRule],
        ['not_in', notIn],
        ['enum', enumRule],
        ['starts_with', startsWith],
        ['ends_with', endsWith],
        ['doesnt_start_with', doesntStartWith],
        ['doesnt_end_with', doesntEndWith],
        ['contains', contains],
        ['doesnt_contain', doesntContain],
        ['required_if', requiredIf],
        ['required_unless', requiredUnless],
        ['required_with', requiredWith],
        ['required_without', requiredWithout],
        ['accepted_if', acceptedIf],
        ['declined_if', declinedIf],
        ['missing_if', missingIf],
        ['missing_with', missingWith],
        ['present_if', presentIf],
        ['present_with', presentWith],
        ['prohibited_if', prohibitedIf],
        ['prohibits', prohibits],
        ['mimes', mimes],
        ['mimetypes', mimetypes],
        ['extensions', extensions],
        ['min_digits', minDigitsRule],
        ['max_digits', maxDigitsRule],
        ['in_array', inArrayField],
        ['in_array_keys', inArrayKeys],
        ['digits', digits],
        ['digits_between', digitsBetween],
    ];

    it.each(noThrowCases)('%s returns a boolean instead of throwing without params', (_name, fn) => {
        let result;
        expect(() => { result = fn(undefined); }).not.toThrow();
        expect(typeof result).toBe('boolean');
        expect(() => { result = fn('value'); }).not.toThrow();
        expect(typeof result).toBe('boolean');
    });

    it('untriggered conditionals pass when no condition params are given', () => {
        expect(requiredIf('')).toBe(true);
        expect(requiredUnless('')).toBe(true);
        expect(requiredWith('')).toBe(true);
        expect(missingIf('x')).toBe(true);
        expect(presentIf(undefined)).toBe(true);
        expect(prohibitedIf('x')).toBe(true);
        expect(prohibits('x')).toBe(true);
    });

    it('positive matchers fail closed when they cannot evaluate', () => {
        expect(same('x')).toBe(false);
        expect(inRule('x')).toBe(false);
        expect(mimes(Object, )).toBe(false);
    });

    it('multiple_of rejects weird input without throwing', () => {
        expect(multipleOf('abc', ['5'])).toBe(false);
        expect(multipleOf(10, ['0'])).toBe(false);
        expect(multipleOf(10, ['5'])).toBe(true);
    });
});

describe('Rules audit - registry messages cover every exported rule', () => {
    it('has a default message for every exported rule', () => {
        const names = Object.keys(rulesIndex);
        expect(names.length).toBeGreaterThan(90);
        for (const name of names) {
            expect(registry.defaultMessages[name], `missing default message for "${name}"`)
                .toBeTypeOf('string');
        }
    });

    it('uses Laravel wording for the previously missing entries', () => {
        expect(registry.getMessage('array')).toBe('The :attribute must be an array.');
    });
});
