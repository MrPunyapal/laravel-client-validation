export default function required(value) {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'boolean') return true;
    return value !== null && value !== undefined && value !== '';
}
