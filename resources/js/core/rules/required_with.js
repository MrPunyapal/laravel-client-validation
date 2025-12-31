export default function requiredWith(value, params, field, context = {}) {
    const allData = context.allData || {};

    const hasOtherField = params.some(otherField => {
        const otherValue = allData[otherField];
        if (otherValue === null || otherValue === undefined) return false;
        if (typeof otherValue === 'string') return otherValue.trim() !== '';
        if (Array.isArray(otherValue)) return otherValue.length > 0;
        return true;
    });

    if (!hasOtherField) return true;

    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
}
