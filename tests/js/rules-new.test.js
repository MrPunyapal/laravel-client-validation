import { describe, it, expect } from 'vitest';

import notRegex from '../../resources/js/core/rules/not_regex.js';
import contains from '../../resources/js/core/rules/contains.js';
import doesntContain from '../../resources/js/core/rules/doesnt_contain.js';
import inArrayField from '../../resources/js/core/rules/in_array.js';
import inArrayKeys from '../../resources/js/core/rules/in_array_keys.js';
import list from '../../resources/js/core/rules/list.js';
import missing from '../../resources/js/core/rules/missing.js';
import missingIf from '../../resources/js/core/rules/missing_if.js';
import missingUnless from '../../resources/js/core/rules/missing_unless.js';
import missingWith from '../../resources/js/core/rules/missing_with.js';
import missingWithAll from '../../resources/js/core/rules/missing_with_all.js';
import presentIf from '../../resources/js/core/rules/present_if.js';
import presentUnless from '../../resources/js/core/rules/present_unless.js';
import presentWith from '../../resources/js/core/rules/present_with.js';
import presentWithAll from '../../resources/js/core/rules/present_with_all.js';
import prohibitedIfAccepted from '../../resources/js/core/rules/prohibited_if_accepted.js';
import prohibitedIfDeclined from '../../resources/js/core/rules/prohibited_if_declined.js';
import prohibits from '../../resources/js/core/rules/prohibits.js';
import requiredIfAccepted from '../../resources/js/core/rules/required_if_accepted.js';
import requiredIfDeclined from '../../resources/js/core/rules/required_if_declined.js';
import enumRule from '../../resources/js/core/rules/enum.js';
import file from '../../resources/js/core/rules/file.js';
import image from '../../resources/js/core/rules/image.js';
import mimes from '../../resources/js/core/rules/mimes.js';
import mimetypes from '../../resources/js/core/rules/mimetypes.js';
import extensions from '../../resources/js/core/rules/extensions.js';
import prohibited from '../../resources/js/core/rules/prohibited.js';

describe('New Validation Rules', () => {
    describe('not_regex', () => {
        it('fails when value matches pattern', () => {
            expect(notRegex('abc123', ['/^[a-z]+\\d+$/'])).toBe(false);
        });

        it('passes when value does not match pattern', () => {
            expect(notRegex('hello', ['/^\\d+$/'])).toBe(true);
        });

        it('passes for empty values', () => {
            expect(notRegex('', ['/^\\d+$/'])).toBe(true);
        });
    });

    describe('contains', () => {
        it('passes when array contains all values', () => {
            expect(contains(['admin', 'editor', 'user'], ['admin', 'editor'])).toBe(true);
        });

        it('fails when array is missing a value', () => {
            expect(contains(['admin'], ['admin', 'editor'])).toBe(false);
        });

        it('fails for non-array values', () => {
            expect(contains('string', ['a'])).toBe(false);
        });
    });

    describe('doesnt_contain', () => {
        it('passes when array does not contain any values', () => {
            expect(doesntContain(['user', 'viewer'], ['admin', 'editor'])).toBe(true);
        });

        it('fails when array contains a listed value', () => {
            expect(doesntContain(['admin', 'user'], ['admin', 'editor'])).toBe(false);
        });

        it('passes for non-array values', () => {
            expect(doesntContain('string', ['a'])).toBe(true);
        });
    });

    describe('in_array', () => {
        it('passes when value exists in another fields array', () => {
            expect(inArrayField('NYC', ['airports'], 'origin', { allData: { airports: ['NYC', 'LAX'] } })).toBe(true);
        });

        it('fails when value does not exist in another fields array', () => {
            expect(inArrayField('SFO', ['airports'], 'origin', { allData: { airports: ['NYC', 'LAX'] } })).toBe(false);
        });

        it('handles wildcard field notation', () => {
            expect(inArrayField('a', ['items.*'], 'val', { allData: { items: ['a', 'b', 'c'] } })).toBe(true);
        });
    });

    describe('in_array_keys', () => {
        it('passes when object has at least one given key', () => {
            expect(inArrayKeys({ timezone: 'UTC', locale: 'en' }, ['timezone'])).toBe(true);
        });

        it('fails when object has none of the given keys', () => {
            expect(inArrayKeys({ locale: 'en' }, ['timezone'])).toBe(false);
        });

        it('fails for non-object values', () => {
            expect(inArrayKeys('string', ['key'])).toBe(false);
            expect(inArrayKeys(['a'], ['key'])).toBe(false);
        });
    });

    describe('list', () => {
        it('passes for sequential arrays', () => {
            expect(list(['a', 'b', 'c'])).toBe(true);
            expect(list([])).toBe(true);
        });

        it('fails for non-array values', () => {
            expect(list('string')).toBe(false);
            expect(list(123)).toBe(false);
        });
    });

    describe('missing', () => {
        it('passes when value is undefined', () => {
            expect(missing(undefined)).toBe(true);
        });

        it('fails when value is present', () => {
            expect(missing('')).toBe(false);
            expect(missing(null)).toBe(false);
            expect(missing('hello')).toBe(false);
        });
    });

    describe('missing_if', () => {
        it('must be missing when condition met', () => {
            expect(missingIf(undefined, ['type', 'free'], 'field', { allData: { type: 'free' } })).toBe(true);
            expect(missingIf('value', ['type', 'free'], 'field', { allData: { type: 'free' } })).toBe(false);
        });

        it('passes regardless when condition not met', () => {
            expect(missingIf('value', ['type', 'free'], 'field', { allData: { type: 'paid' } })).toBe(true);
        });
    });

    describe('missing_unless', () => {
        it('must be missing unless condition met', () => {
            expect(missingUnless(undefined, ['type', 'paid'], 'field', { allData: { type: 'free' } })).toBe(true);
            expect(missingUnless('value', ['type', 'paid'], 'field', { allData: { type: 'free' } })).toBe(false);
        });

        it('passes when condition is met', () => {
            expect(missingUnless('value', ['type', 'paid'], 'field', { allData: { type: 'paid' } })).toBe(true);
        });
    });

    describe('missing_with', () => {
        it('must be missing when any specified field is present', () => {
            expect(missingWith(undefined, ['name'], 'field', { allData: { name: 'John' } })).toBe(true);
            expect(missingWith('value', ['name'], 'field', { allData: { name: 'John' } })).toBe(false);
        });

        it('passes when none of the specified fields are present', () => {
            expect(missingWith('value', ['name'], 'field', { allData: {} })).toBe(true);
        });
    });

    describe('missing_with_all', () => {
        it('must be missing when all specified fields are present', () => {
            expect(missingWithAll(undefined, ['a', 'b'], 'field', { allData: { a: 1, b: 2 } })).toBe(true);
            expect(missingWithAll('value', ['a', 'b'], 'field', { allData: { a: 1, b: 2 } })).toBe(false);
        });

        it('passes when not all specified fields are present', () => {
            expect(missingWithAll('value', ['a', 'b'], 'field', { allData: { a: 1 } })).toBe(true);
        });
    });

    describe('present_if', () => {
        it('must be present when condition met', () => {
            expect(presentIf('val', ['type', 'a'], 'field', { allData: { type: 'a' } })).toBe(true);
            expect(presentIf(undefined, ['type', 'a'], 'field', { allData: { type: 'a' } })).toBe(false);
        });

        it('passes regardless when condition not met', () => {
            expect(presentIf(undefined, ['type', 'a'], 'field', { allData: { type: 'b' } })).toBe(true);
        });
    });

    describe('present_unless', () => {
        it('must be present unless condition met', () => {
            expect(presentUnless('val', ['type', 'a'], 'field', { allData: { type: 'b' } })).toBe(true);
            expect(presentUnless(undefined, ['type', 'a'], 'field', { allData: { type: 'b' } })).toBe(false);
        });

        it('passes when condition is met', () => {
            expect(presentUnless(undefined, ['type', 'a'], 'field', { allData: { type: 'a' } })).toBe(true);
        });
    });

    describe('present_with', () => {
        it('must be present when specified field is present', () => {
            expect(presentWith('val', ['name'], 'field', { allData: { name: 'John' } })).toBe(true);
            expect(presentWith(undefined, ['name'], 'field', { allData: { name: 'John' } })).toBe(false);
        });

        it('passes when specified field is absent', () => {
            expect(presentWith(undefined, ['name'], 'field', { allData: {} })).toBe(true);
        });
    });

    describe('present_with_all', () => {
        it('must be present when all specified fields are present', () => {
            expect(presentWithAll('val', ['a', 'b'], 'field', { allData: { a: 1, b: 2 } })).toBe(true);
            expect(presentWithAll(undefined, ['a', 'b'], 'field', { allData: { a: 1, b: 2 } })).toBe(false);
        });

        it('passes when not all specified fields are present', () => {
            expect(presentWithAll(undefined, ['a', 'b'], 'field', { allData: { a: 1 } })).toBe(true);
        });
    });

    describe('prohibited (fixed)', () => {
        it('passes for empty values', () => {
            expect(prohibited(null)).toBe(true);
            expect(prohibited(undefined)).toBe(true);
            expect(prohibited('')).toBe(true);
            expect(prohibited([])).toBe(true);
        });

        it('fails for non-empty values', () => {
            expect(prohibited('value')).toBe(false);
            expect(prohibited(123)).toBe(false);
            expect(prohibited(['a'])).toBe(false);
        });
    });

    describe('prohibited_if_accepted', () => {
        it('must be empty when other field is accepted', () => {
            expect(prohibitedIfAccepted('', ['terms'], 'field', { allData: { terms: 'yes' } })).toBe(true);
            expect(prohibitedIfAccepted('value', ['terms'], 'field', { allData: { terms: 'yes' } })).toBe(false);
            expect(prohibitedIfAccepted('value', ['terms'], 'field', { allData: { terms: true } })).toBe(false);
        });

        it('passes when other field is not accepted', () => {
            expect(prohibitedIfAccepted('value', ['terms'], 'field', { allData: { terms: 'no' } })).toBe(true);
        });
    });

    describe('prohibited_if_declined', () => {
        it('must be empty when other field is declined', () => {
            expect(prohibitedIfDeclined('', ['terms'], 'field', { allData: { terms: 'no' } })).toBe(true);
            expect(prohibitedIfDeclined('value', ['terms'], 'field', { allData: { terms: 'no' } })).toBe(false);
            expect(prohibitedIfDeclined('value', ['terms'], 'field', { allData: { terms: false } })).toBe(false);
        });

        it('passes when other field is not declined', () => {
            expect(prohibitedIfDeclined('value', ['terms'], 'field', { allData: { terms: 'yes' } })).toBe(true);
        });
    });

    describe('prohibits', () => {
        it('when present, other fields must be empty', () => {
            expect(prohibits('val', ['other'], 'field', { allData: { other: '' } })).toBe(true);
            expect(prohibits('val', ['other'], 'field', { allData: { other: 'data' } })).toBe(false);
        });

        it('passes when field itself is empty', () => {
            expect(prohibits('', ['other'], 'field', { allData: { other: 'data' } })).toBe(true);
            expect(prohibits(null, ['other'], 'field', { allData: { other: 'data' } })).toBe(true);
        });
    });

    describe('required_if_accepted', () => {
        it('required when other field is accepted', () => {
            expect(requiredIfAccepted('value', ['terms'], 'field', { allData: { terms: 'yes' } })).toBe(true);
            expect(requiredIfAccepted('', ['terms'], 'field', { allData: { terms: 'yes' } })).toBe(false);
            expect(requiredIfAccepted('', ['terms'], 'field', { allData: { terms: true } })).toBe(false);
        });

        it('not required when other field is not accepted', () => {
            expect(requiredIfAccepted('', ['terms'], 'field', { allData: { terms: 'no' } })).toBe(true);
        });
    });

    describe('required_if_declined', () => {
        it('required when other field is declined', () => {
            expect(requiredIfDeclined('value', ['agree'], 'field', { allData: { agree: 'no' } })).toBe(true);
            expect(requiredIfDeclined('', ['agree'], 'field', { allData: { agree: 'no' } })).toBe(false);
            expect(requiredIfDeclined('', ['agree'], 'field', { allData: { agree: false } })).toBe(false);
        });

        it('not required when other field is not declined', () => {
            expect(requiredIfDeclined('', ['agree'], 'field', { allData: { agree: 'yes' } })).toBe(true);
        });
    });

    describe('enum', () => {
        it('passes when value is in allowed list', () => {
            expect(enumRule('active', ['active', 'pending', 'inactive'])).toBe(true);
            expect(enumRule('pending', ['active', 'pending', 'inactive'])).toBe(true);
        });

        it('fails when value is not in allowed list', () => {
            expect(enumRule('deleted', ['active', 'pending', 'inactive'])).toBe(false);
        });

        it('passes for empty values', () => {
            expect(enumRule('', ['active'])).toBe(true);
            expect(enumRule(null, ['active'])).toBe(true);
        });

        it('handles numeric values', () => {
            expect(enumRule(1, ['1', '2', '3'])).toBe(true);
            expect(enumRule(0, ['0', '1'])).toBe(true);
        });
    });

    describe('file', () => {
        it('passes for empty values', () => {
            expect(file('')).toBe(true);
            expect(file(null)).toBe(true);
        });

        it('fails for non-file values', () => {
            expect(file('string')).toBe(false);
            expect(file(123)).toBe(false);
        });
    });

    describe('image', () => {
        it('passes for empty values', () => {
            expect(image('')).toBe(true);
            expect(image(null)).toBe(true);
        });

        it('validates by MIME type', () => {
            expect(image({ type: 'image/jpeg', name: 'photo.jpg' })).toBe(true);
            expect(image({ type: 'image/png', name: 'photo.png' })).toBe(true);
            expect(image({ type: 'application/pdf', name: 'doc.pdf' })).toBe(false);
        });

        it('validates by extension when no MIME', () => {
            expect(image({ name: 'photo.jpg' })).toBe(true);
            expect(image({ name: 'doc.pdf' })).toBe(false);
        });

        it('rejects SVG by default', () => {
            expect(image({ type: 'image/svg+xml', name: 'icon.svg' })).toBe(false);
        });

        it('allows SVG with allow_svg param', () => {
            expect(image({ type: 'image/svg+xml', name: 'icon.svg' }, ['allow_svg'])).toBe(true);
        });
    });

    describe('mimes', () => {
        it('passes for empty values', () => {
            expect(mimes('', ['jpg'])).toBe(true);
        });

        it('validates by extension', () => {
            expect(mimes({ name: 'photo.jpg', type: 'image/jpeg' }, ['jpg', 'png'])).toBe(true);
            expect(mimes({ name: 'doc.pdf', type: 'application/pdf' }, ['jpg', 'png'])).toBe(false);
        });

        it('validates by MIME type', () => {
            expect(mimes({ name: 'file', type: 'image/jpeg' }, ['jpg'])).toBe(true);
        });
    });

    describe('mimetypes', () => {
        it('passes for empty values', () => {
            expect(mimetypes('', ['image/jpeg'])).toBe(true);
        });

        it('validates exact MIME type', () => {
            expect(mimetypes({ type: 'image/jpeg' }, ['image/jpeg', 'image/png'])).toBe(true);
            expect(mimetypes({ type: 'text/plain' }, ['image/jpeg'])).toBe(false);
        });

        it('supports wildcard MIME types', () => {
            expect(mimetypes({ type: 'image/jpeg' }, ['image/*'])).toBe(true);
            expect(mimetypes({ type: 'video/mp4' }, ['image/*'])).toBe(false);
        });
    });

    describe('extensions', () => {
        it('passes for empty values', () => {
            expect(extensions('', ['jpg'])).toBe(true);
        });

        it('validates file extension', () => {
            expect(extensions({ name: 'photo.jpg' }, ['jpg', 'png'])).toBe(true);
            expect(extensions({ name: 'doc.pdf' }, ['jpg', 'png'])).toBe(false);
        });

        it('is case-insensitive', () => {
            expect(extensions({ name: 'photo.JPG' }, ['jpg'])).toBe(true);
        });
    });
});
