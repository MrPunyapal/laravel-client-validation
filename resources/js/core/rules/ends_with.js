export default function endsWith(value, suffixes) {
    if (!value) return true;
    if (typeof value !== 'string') return false;
    return suffixes.some(suffix => value.endsWith(suffix));
}
