export default function presentUnless(value, params, field, context = {}) {
    const [otherField, ...expectedValues] = params;
    const allData = context.allData || {};
    const otherValue = String(allData[otherField] ?? '');

    const exempt = expectedValues.some(v => String(v) === otherValue);

    if (exempt) return true;

    return value !== undefined;
}
