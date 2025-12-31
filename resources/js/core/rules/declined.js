export default function declined(value) {
    const declinedValues = [false, 'false', 0, '0', 'no', 'off'];
    return declinedValues.includes(value);
}
