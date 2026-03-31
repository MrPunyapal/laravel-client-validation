export default function confirmed(value, params, field, context = {}) {
    const fieldName = context.field || field || '';
    const allData = context.allData || {};

    const confirmationField = (params && params[0])
        ? params[0]
        : `${fieldName}_confirmation`;

    return value === allData[confirmationField];
}
