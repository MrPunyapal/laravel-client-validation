export default function max(value, [maximum], field, context = {}) {
    if (!value && value !== 0) return true;

    const max = Number(maximum);

    // Check if 'numeric' rule is present in the field's rules
    const hasNumericRule = context.rules && context.rules.some(rule => rule.startsWith('numeric'));

    if (typeof value === 'string') {
        // If numeric rule is present, validate as number
        if (hasNumericRule) {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                return numValue <= max;
            }
        }
        // Otherwise validate string length
        return value.length <= max;
    }

    if (typeof value === 'number') {
        return value <= max;
    }

    if (Array.isArray(value)) {
        return value.length <= max;
    }

    if (value instanceof File) {
        return (value.size / 1024) <= max;
    }

    return true;
}
