export default function presentIf(value, params, field, context = {}) {
    const [otherField, ...expectedValues] = params;
    const allData = context.allData || {};
    const otherValue = String(allData[otherField] ?? '');

    const shouldBePresent = expectedValues.some(v => String(v) === otherValue);

    if (!shouldBePresent) return true;

    return value !== undefined;
}
