export default function required_with_all(value, params, field, context = {}) {
    if (!params || params.length === 0) return true;

    const allData = context.allData || {};

    const hasValue = (val) => val !== undefined && val !== null && val !== '';

    const allFieldsPresent = params.every((fieldName) => {
        const fieldValue = allData[fieldName];
        return hasValue(fieldValue);
    });

    if (!allFieldsPresent) return true;

    return hasValue(value);
}
