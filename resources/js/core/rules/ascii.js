export default function ascii(value) {
    if (!value) return true;
    return /^[\x00-\x7F]*$/.test(value);
}
