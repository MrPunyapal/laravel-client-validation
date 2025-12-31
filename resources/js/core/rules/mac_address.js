export default function macAddress(value) {
    if (!value) return true;

    const patterns = [
        /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
        /^([0-9A-Fa-f]{2}){6}$/,
        /^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/
    ];

    return patterns.some(pattern => pattern.test(value));
}
