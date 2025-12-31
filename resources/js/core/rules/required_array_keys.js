export default function required_array_keys(value, params) {
    if (value === null || value === undefined || value === '') return true;
    if (!params || params.length === 0) return true;

    if (typeof value !== 'object' || Array.isArray(value)) return false;

    return params.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}
