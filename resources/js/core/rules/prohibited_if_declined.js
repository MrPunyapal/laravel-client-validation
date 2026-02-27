export default function prohibitedIfDeclined(value, params, field, context = {}) {
    const allData = context.allData || {};
    const declinedValues = [false, 'false', 0, '0', 'no', 'off'];

    const shouldBeProhibited = params.some(f => declinedValues.includes(allData[f]));

    if (!shouldBeProhibited) return true;

    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}
