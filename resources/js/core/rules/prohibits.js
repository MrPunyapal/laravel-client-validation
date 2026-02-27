export default function prohibits(value, params, field, context = {}) {
    const allData = context.allData || {};

    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;

    return params.every(f => {
        const other = allData[f];
        if (other === null || other === undefined || other === '') return true;
        if (Array.isArray(other)) return other.length === 0;
        return false;
    });
}
