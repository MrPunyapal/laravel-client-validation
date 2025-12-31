export default function different(value, [otherField], field, context = {}) {
    const allData = context.allData || context || {};
    return value !== allData[otherField];
}
