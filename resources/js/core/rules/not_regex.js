export default function notRegex(value, [pattern, flags = '']) {
    if (!value) return true;

    try {
        let cleanPattern = pattern;
        if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
            const lastSlash = pattern.lastIndexOf('/');
            cleanPattern = pattern.slice(1, lastSlash);
            if (!flags && lastSlash < pattern.length - 1) {
                flags = pattern.slice(lastSlash + 1);
            }
        }

        const regex = new RegExp(cleanPattern, flags);
        return !regex.test(value);
    } catch (e) {
        console.warn('Invalid regex pattern:', pattern);
        return false;
    }
}
