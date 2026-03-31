export default function numeric(value, params) {
    if (value === null || value === undefined || value === '') return true;

    if (typeof value === 'boolean') return false;

    const strict = params && params.includes('strict');

    if (strict) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }

    return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
}
