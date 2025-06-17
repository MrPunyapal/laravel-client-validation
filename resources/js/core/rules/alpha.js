export default function alpha(value) {
    if (!value) return true;
    return /^[a-zA-Z]+$/.test(value);
}
