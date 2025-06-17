export default function alphaNum(value) {
    if (!value) return true;
    return /^[a-zA-Z0-9]+$/.test(value);
}
