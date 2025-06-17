export default function confirmed(value, params, field, data = {}) {
    const confirmationField = `${field}_confirmation`;
    return value === data[confirmationField];
}
