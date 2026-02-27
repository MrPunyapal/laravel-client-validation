export default function list(value) {
    if (!Array.isArray(value)) return false;

    const keys = Object.keys(value).map(Number);
    return keys.every((key, index) => key === index);
}
