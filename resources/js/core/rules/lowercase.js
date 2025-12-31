export default function lowercase(value) {
    if (!value) return true;
    if (typeof value !== 'string') return false;
    return value === value.toLowerCase();
}
