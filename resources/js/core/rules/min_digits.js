export default function min_digits(value, params) {
    if (value === null || value === undefined || value === '') return true;

    const min = parseInt(params[0], 10);
    if (isNaN(min)) return true;

    const strValue = String(value).replace(/[^0-9]/g, '');
    return strValue.length >= min;
}
