export default function boolean(value) {
    if (value === null || value === undefined || value === '') return true;

    const acceptedValues = [true, false, 1, 0, '1', '0', 'true', 'false', 'on', 'yes', 'no'];
    return acceptedValues.includes(value);
}
