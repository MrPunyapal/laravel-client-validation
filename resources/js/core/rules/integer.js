export default function integer(value) {
    if (!value && value !== 0) return true;
    return Number.isInteger(Number(value)) && !isNaN(Number(value));
}
