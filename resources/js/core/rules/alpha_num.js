export default function alphaNum(value, params) {
    if (!value) return true;

    const ascii = params && params.includes('ascii');

    if (ascii) {
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    return /^[\p{L}\p{M}\p{N}]+$/u.test(value);
}
