export default function alpha(value, params) {
    if (!value) return true;

    const ascii = params && params.includes('ascii');

    if (ascii) {
        return /^[a-zA-Z]+$/.test(value);
    }

    return /^[\p{L}\p{M}]+$/u.test(value);
}
