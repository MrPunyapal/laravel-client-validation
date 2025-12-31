export default function declinedIf(value, params, field, context = {}) {
    const [otherField, ...expectedValues] = params;
    const allData = context.allData || {};
    const otherValue = String(allData[otherField] ?? '');

    const shouldBeDeclined = expectedValues.some(v => String(v) === otherValue);

    if (!shouldBeDeclined) return true;

    const declinedValues = [false, 'false', 0, '0', 'no', 'off'];
    return declinedValues.includes(value);
}
