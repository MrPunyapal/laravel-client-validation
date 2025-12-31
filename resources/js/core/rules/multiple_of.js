export default function multipleOf(value, [divisor]) {
    if (!value && value !== 0) return true;

    const num = Number(value);
    const div = Number(divisor);

    if (isNaN(num) || isNaN(div) || div === 0) return false;

    const result = num / div;
    return Number.isInteger(result);
}
