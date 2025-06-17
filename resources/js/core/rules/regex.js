export default function regex(value, [pattern, flags = '']) {
    if (!value) return true;

    try {
        const regex = new RegExp(pattern, flags);
        return regex.test(value);
    } catch (e) {
        console.warn('Invalid regex pattern:', pattern);
        return false;
    }
}
