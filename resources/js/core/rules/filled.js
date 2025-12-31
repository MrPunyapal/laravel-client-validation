export default function filled(value) {
    if (value === undefined) return true;
    if (value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
}
