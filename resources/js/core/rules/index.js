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

    digits: integer,
    digits_between: between,
    string: (value) => typeof value === 'string' || !value,
    nullable: () => true,
};
