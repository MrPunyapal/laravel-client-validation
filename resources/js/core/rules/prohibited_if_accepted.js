export default function prohibitedIfAccepted(value, params, field, context = {}) {
    const allData = context.allData || {};
    const acceptedValues = [true, 'true', 1, '1', 'yes', 'on'];

    const shouldBeProhibited = params.some(f => acceptedValues.includes(allData[f]));

    if (!shouldBeProhibited) return true;

    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}
