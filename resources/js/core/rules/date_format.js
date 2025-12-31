export default function date_format(value, params) {
    if (value === null || value === undefined || value === '') return true;
    if (!params || params.length === 0) return true;

    const format = params[0];
    const str = String(value);

    const formatPatterns = {
        'Y': '(\\d{4})',
        'm': '(0[1-9]|1[0-2])',
        'd': '(0[1-9]|[12]\\d|3[01])',
        'H': '([01]\\d|2[0-3])',
        'i': '([0-5]\\d)',
        's': '([0-5]\\d)',
        'n': '([1-9]|1[0-2])',
        'j': '([1-9]|[12]\\d|3[01])',
        'G': '([0-9]|1\\d|2[0-3])',
        'g': '([1-9]|1[0-2])',
        'A': '(AM|PM)',
        'a': '(am|pm)',
    };

    let regexPattern = format;

    regexPattern = regexPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (const [token, pattern] of Object.entries(formatPatterns)) {
        regexPattern = regexPattern.replace(new RegExp('\\\\' + token, 'g'), pattern);
    }

    try {
        const regex = new RegExp('^' + regexPattern + '$');
        return regex.test(str);
    } catch {
        return true;
    }
}
