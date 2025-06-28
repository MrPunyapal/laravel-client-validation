export default function regex(value, [pattern, flags = '']) {
    if (!value) return true;

    try {
        // Remove leading and trailing slashes if present (Laravel format)
        let cleanPattern = pattern;
        if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
            const lastSlash = pattern.lastIndexOf('/');
            cleanPattern = pattern.slice(1, lastSlash);
            // Extract flags after the last slash if no flags parameter provided
            if (!flags && lastSlash < pattern.length - 1) {
                flags = pattern.slice(lastSlash + 1);
            }
        }

        const regex = new RegExp(cleanPattern, flags);
        return regex.test(value);
    } catch (e) {
        console.warn('Invalid regex pattern:', pattern);
        return false;
    }
}
