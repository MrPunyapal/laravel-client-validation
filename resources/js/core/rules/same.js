export default function same(value, params, field, context = {}) {
    const otherField = params[0];
    const allData = context.allData || context || {};
    return value === allData[otherField];
}
