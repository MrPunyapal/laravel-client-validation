export default function numeric(value) {
    // Allow empty/null/undefined values
    if (value === null || value === undefined || value === '') return true;

    // Explicitly reject boolean values
    if (typeof value === 'boolean') return false;

    return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
}
