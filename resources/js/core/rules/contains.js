export default function contains(value, params) {
    if (!Array.isArray(value)) return false;

    const stringValues = value.map(v => String(v));
    return params.every(param => stringValues.includes(String(param)));
}
