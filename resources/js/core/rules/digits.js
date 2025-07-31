export default function digits(value, params) {
    if (!value || typeof value !== 'string') return false;
    if (!params || params.length === 0) return false;

    const digits = value.replace(/\D/g, '');
    const expected = parseInt(params[0]);

    return digits.length === expected;
}
