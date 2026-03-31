export default function boolean(value, params) {
    if (value === null || value === undefined || value === '') return true;

    const strict = params && params.includes('strict');

    if (strict) {
        return value === true || value === false;
    }

    const acceptedValues = [true, false, 1, 0, '1', '0', 'true', 'false', 'on'];
    return acceptedValues.includes(value);
}
