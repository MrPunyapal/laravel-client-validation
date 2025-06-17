export default function alphaDash(value) {
    if (!value) return true;
    return /^[a-zA-Z0-9_-]+$/.test(value);
}
