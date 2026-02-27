export default function enumRule(value, params) {
    if (!value && value !== 0) return true;

    return params.map(v => String(v)).includes(String(value));
}
