export default function confirmed(value, params, context = {}) {
    const field = context.field || '';
    const allData = context.allData || {};
    const confirmationField = `${field}_confirmation`;
    return value === allData[confirmationField];
}
