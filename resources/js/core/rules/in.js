export default function inArray(value, params) {
    if (!value && value !== 0) return true;
    return params.includes(String(value));
}
