export default function boolean(value) {
    if (value === null || value === undefined || value === '') return true;

    // According to Laravel's boolean validation rule, only these values are accepted
    const acceptedValues = [true, false, 1, 0, '1', '0', 'true', 'false', 'on'];
    return acceptedValues.includes(value);
}
