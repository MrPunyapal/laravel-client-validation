export default function inArrayKeys(value, params) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

    const keys = Object.keys(value);
    return params.some(param => keys.includes(String(param)));
}
