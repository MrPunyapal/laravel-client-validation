export default function uppercase(value) {
    if (!value) return true;
    if (typeof value !== 'string') return false;
    return value === value.toUpperCase();
}
