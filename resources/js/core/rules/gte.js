export default function gte(value, [otherField], field, context = {}) {
    if (!value && value !== 0) return true;

    const otherValue = context.allData?.[otherField];
    if (otherValue === undefined) return false;

    const numValue = Number(value);
    const numOther = Number(otherValue);

    if (!isNaN(numValue) && !isNaN(numOther)) {
        return numValue >= numOther;
    }

    if (typeof value === 'string' && typeof otherValue === 'string') {
        return value.length >= otherValue.length;
    }

    if (Array.isArray(value) && Array.isArray(otherValue)) {
        return value.length >= otherValue.length;
    }

    return false;
}
