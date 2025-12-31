export default function startsWith(value, prefixes) {
    if (!value) return true;
    if (typeof value !== 'string') return false;
    return prefixes.some(prefix => value.startsWith(prefix));
}
