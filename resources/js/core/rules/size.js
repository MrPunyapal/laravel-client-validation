export default function size(value, [size]) {
    if (!value && value !== 0) return true;

    const expectedSize = Number(size);

    if (typeof value === 'string') {
        return value.length === expectedSize;
    }

    if (typeof value === 'number') {
        return value === expectedSize;
    }

    if (Array.isArray(value)) {
        return value.length === expectedSize;
    }

    if (value instanceof File) {
        return Math.round(value.size / 1024) === expectedSize;
    }

    return false;
}
