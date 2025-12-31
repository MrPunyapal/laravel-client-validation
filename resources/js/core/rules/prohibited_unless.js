export default function prohibitedUnless(value, params, field, context = {}) {
    const [otherField, ...expectedValues] = params;
    const allData = context.allData || {};
    const otherValue = String(allData[otherField] ?? '');

    const shouldBeProhibited = !expectedValues.some(v => String(v) === otherValue);

    if (!shouldBeProhibited) return true;

    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}
