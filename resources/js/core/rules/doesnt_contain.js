export default function doesntContain(value, params) {
    if (!Array.isArray(value)) return true;

    const stringValues = value.map(v => String(v));
    return !params.some(param => stringValues.includes(String(param)));
}
