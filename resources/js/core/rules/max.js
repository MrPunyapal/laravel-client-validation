export default function max(value, [maximum]) {
    if (!value && value !== 0) return true;

    const max = Number(maximum);

    if (typeof value === 'string') {
        return value.length <= max;
    }

    if (typeof value === 'number') {
        return value <= max;
    }

    if (Array.isArray(value)) {
        return value.length <= max;
    }

    if (value instanceof File) {
        return (value.size / 1024) <= max;
    }

    return true;
}
