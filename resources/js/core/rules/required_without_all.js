export default function required_without_all(value, params, field, context = {}) {
    if (!params || params.length === 0) return true;

    const allData = context.allData || {};

    const hasValue = (val) => val !== undefined && val !== null && val !== '';

    const allFieldsMissing = params.every((fieldName) => {
        const fieldValue = allData[fieldName];
        return !hasValue(fieldValue);
    });

    if (!allFieldsMissing) return true;

    return hasValue(value);
}
