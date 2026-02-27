export default function presentWith(value, params, field, context = {}) {
    const allData = context.allData || {};

    const anyPresent = params.some(f => allData[f] !== undefined);

    if (!anyPresent) return true;

    return value !== undefined;
}
