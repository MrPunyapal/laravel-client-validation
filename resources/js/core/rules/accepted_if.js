export default function acceptedIf(value, params, field, context = {}) {
    const [otherField, ...expectedValues] = params;
    const allData = context.allData || {};
    const otherValue = String(allData[otherField] ?? '');

    const shouldBeAccepted = expectedValues.some(v => String(v) === otherValue);

    if (!shouldBeAccepted) return true;

    const acceptedValues = [true, 'true', 1, '1', 'yes', 'on'];
    return acceptedValues.includes(value);
}
