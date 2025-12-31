export default function json(value) {
    if (!value) return true;
    if (typeof value !== 'string') return false;
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}
