export default function decimal(value, params = []) {
    if (!value && value !== 0) return true;

    const str = String(value);
    const decimalMatch = str.match(/^-?\d+\.(\d+)$/);

    if (!decimalMatch) {
        return params.length === 0 || (params[0] === '0' && /^-?\d+$/.test(str));
    }

    const decimalPlaces = decimalMatch[1].length;
    const [min, max] = params;

    if (min !== undefined && max !== undefined) {
        return decimalPlaces >= Number(min) && decimalPlaces <= Number(max);
    }

    if (min !== undefined) {
        return decimalPlaces === Number(min);
    }

    return true;
}
