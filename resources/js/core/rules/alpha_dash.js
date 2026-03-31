export default function alphaDash(value, params) {
    if (!value) return true;

    const ascii = params && params.includes('ascii');

    if (ascii) {
        return /^[a-zA-Z0-9_-]+$/.test(value);
    }

    return /^[\p{L}\p{M}\p{N}_-]+$/u.test(value);
}
