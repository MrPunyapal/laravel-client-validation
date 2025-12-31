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
};
