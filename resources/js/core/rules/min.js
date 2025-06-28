export default function min(value, [minimum]) {
    if (!value && value !== 0) return true;

    const min = Number(minimum);

    if (typeof value === 'string') {
        // If the string is numeric, treat it as a number for validation
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            return numValue >= min;
        }
        // Otherwise validate string length
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
