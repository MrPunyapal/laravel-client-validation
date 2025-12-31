import required from './required.js';
import email from './email.js';
import min from './min.js';
import max from './max.js';
import numeric from './numeric.js';
import integer from './integer.js';
import alpha from './alpha.js';
import alphaNum from './alpha_num.js';
import alphaDash from './alpha_dash.js';
import url from './url.js';
import between from './between.js';
import confirmed from './confirmed.js';
import size from './size.js';
import inArray from './in.js';
import notIn from './not_in.js';
import boolean from './boolean.js';
import date from './date.js';
import after from './after.js';
import before from './before.js';
import regex from './regex.js';
import same from './same.js';
import different from './different.js';
import accepted from './accepted.js';
import digits from './digits.js';
import digitsBetween from './digits_between.js';
import string from './string.js';
import nullable from './nullable.js';
import array from './array.js';
import gt from './gt.js';
import gte from './gte.js';
import lt from './lt.js';
import lte from './lte.js';
import filled from './filled.js';
import present from './present.js';
import startsWith from './starts_with.js';
import endsWith from './ends_with.js';
import uuid from './uuid.js';
import json from './json.js';
import lowercase from './lowercase.js';
import uppercase from './uppercase.js';
import ip from './ip.js';
import ipv4 from './ipv4.js';
import ipv6 from './ipv6.js';
import requiredIf from './required_if.js';
import requiredUnless from './required_unless.js';
import requiredWith from './required_with.js';
import requiredWithout from './required_without.js';
import requiredWithAll from './required_with_all.js';
import requiredWithoutAll from './required_without_all.js';
import afterOrEqual from './after_or_equal.js';
import beforeOrEqual from './before_or_equal.js';
import multipleOf from './multiple_of.js';
import decimal from './decimal.js';
import distinct from './distinct.js';
import macAddress from './mac_address.js';
import ascii from './ascii.js';
import prohibited from './prohibited.js';
import prohibitedIf from './prohibited_if.js';
import prohibitedUnless from './prohibited_unless.js';
import acceptedIf from './accepted_if.js';
import declined from './declined.js';
import declinedIf from './declined_if.js';
import dateEquals from './date_equals.js';
import doesntStartWith from './doesnt_start_with.js';
import doesntEndWith from './doesnt_end_with.js';
import minDigits from './min_digits.js';
import maxDigits from './max_digits.js';
import dateFormat from './date_format.js';
import timezone from './timezone.js';
import requiredArrayKeys from './required_array_keys.js';
import activeUrl from './active_url.js';
import ulid from './ulid.js';
import hexColor from './hex_color.js';

export default {
    required,
    email,
    min,
    max,
    numeric,
    integer,
    alpha,
    alpha_num: alphaNum,
    alpha_dash: alphaDash,
    url,
    between,
    confirmed,
    size,
    in: inArray,
    not_in: notIn,
    boolean,
    date,
    after,
    before,
    regex,
    same,
    different,
    accepted,
    digits,
    digits_between: digitsBetween,
    string,
    nullable,
    array,
    gt,
    gte,
    lt,
    lte,
    filled,
    present,
    starts_with: startsWith,
    ends_with: endsWith,
    uuid,
    json,
    lowercase,
    uppercase,
    ip,
    ipv4,
    ipv6,
    required_if: requiredIf,
    required_unless: requiredUnless,
    required_with: requiredWith,
    required_without: requiredWithout,
    required_with_all: requiredWithAll,
    required_without_all: requiredWithoutAll,
    after_or_equal: afterOrEqual,
    before_or_equal: beforeOrEqual,
    multiple_of: multipleOf,
    decimal,
    distinct,
    mac_address: macAddress,
    ascii,
    prohibited,
    prohibited_if: prohibitedIf,
    prohibited_unless: prohibitedUnless,
    accepted_if: acceptedIf,
    declined,
    declined_if: declinedIf,
    date_equals: dateEquals,
    doesnt_start_with: doesntStartWith,
    doesnt_end_with: doesntEndWith,
    min_digits: minDigits,
    max_digits: maxDigits,
    date_format: dateFormat,
    timezone,
    required_array_keys: requiredArrayKeys,
    active_url: activeUrl,
    ulid,
    hex_color: hexColor,
};
