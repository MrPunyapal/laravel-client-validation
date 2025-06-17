export default function date(value) {
    if (!value) return true;

    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) && value !== '';
}
