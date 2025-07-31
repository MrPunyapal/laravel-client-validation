export default function digitsBetween(value, params) {
    if (!value || typeof value !== 'string') return false;
    if (!params || params.length < 2) return false;

    const digits = value.replace(/\D/g, '');
    const min = parseInt(params[0]);
    const max = parseInt(params[1]);

    return digits.length >= min && digits.length <= max;
}
