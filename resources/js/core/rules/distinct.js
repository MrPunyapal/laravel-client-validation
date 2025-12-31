export default function distinct(value) {
    if (!Array.isArray(value)) return true;
    if (value.length === 0) return true;

    const seen = new Set();
    for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) return false;
        seen.add(key);
    }
    return true;
}
