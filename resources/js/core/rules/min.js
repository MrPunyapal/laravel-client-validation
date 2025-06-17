export default function min(value, [minimum]) {
    if (!value && value !== 0) return true;

    const min = Number(minimum);

    if (typeof value === 'string') {
        return value.length >= min;
    }

    if (typeof value === 'number') {
        return value >= min;
    }

    if (Array.isArray(value)) {
        return value.length >= min;
    }

    if (value instanceof File) {
        return (value.size / 1024) >= min;
    }

    return true;
}
