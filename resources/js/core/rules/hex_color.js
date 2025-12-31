export default function hex_color(value) {
    if (value === null || value === undefined || value === '') return true;

    const hexPattern = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    return hexPattern.test(String(value));
}
