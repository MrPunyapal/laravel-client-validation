export default function doesntStartWith(value, params) {
    if (!value) return true;
    const str = String(value);
    return !params.some(prefix => str.startsWith(prefix));
}
