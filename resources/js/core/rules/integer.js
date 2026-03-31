export default function integer(value, params) {
    if (!value && value !== 0) return true;

    const strict = params && params.includes('strict');

    if (strict) {
        return typeof value === 'number' && Number.isInteger(value);
    }

    return Number.isInteger(Number(value)) && !isNaN(Number(value));
}
