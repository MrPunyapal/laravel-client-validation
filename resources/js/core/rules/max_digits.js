export default function max_digits(value, params) {
    if (value === null || value === undefined || value === '') return true;

    const max = parseInt(params[0], 10);
    if (isNaN(max)) return true;

    const strValue = String(value).replace(/[^0-9]/g, '');
    return strValue.length <= max;
}
