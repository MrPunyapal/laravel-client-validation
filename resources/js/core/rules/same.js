export default function same(value, params, context = {}) {
    const otherField = params[0];
    const allData = context.allData || {};
    return value === allData[otherField];
}
