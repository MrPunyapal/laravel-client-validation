export default function requiredIfAccepted(value, params, field, context = {}) {
    const allData = context.allData || {};
    const acceptedValues = [true, 'true', 1, '1', 'yes', 'on'];

    const isRequired = params.some(f => acceptedValues.includes(allData[f]));

    if (!isRequired) return true;

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return value !== null && value !== undefined && value !== '';
}
