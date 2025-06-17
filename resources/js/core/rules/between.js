export default function between(value, [min, max]) {
    if (!value && value !== 0) return true;

    const minimum = Number(min);
    const maximum = Number(max);

    if (typeof value === 'string') {
        return value.length >= minimum && value.length <= maximum;
    }

    if (typeof value === 'number') {
        return value >= minimum && value <= maximum;
    }

    if (Array.isArray(value)) {
        return value.length >= minimum && value.length <= maximum;
    }

    if (value instanceof File) {
        const sizeInKB = value.size / 1024;
        return sizeInKB >= minimum && sizeInKB <= maximum;
    }

    return false;
}
