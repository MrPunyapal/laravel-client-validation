export default function numeric(value) {
    if (!value && value !== 0) return true;
    return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
}
