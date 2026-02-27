export default function requiredIfDeclined(value, params, field, context = {}) {
    const allData = context.allData || {};
    const declinedValues = [false, 'false', 0, '0', 'no', 'off'];

    const isRequired = params.some(f => declinedValues.includes(allData[f]));

    if (!isRequired) return true;

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return value !== null && value !== undefined && value !== '';
}
