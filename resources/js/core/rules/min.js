export default function min(value, [minimum], field, context = {}) {
    if (!value && value !== 0) return true;

    const min = Number(minimum);

    // Check if 'numeric' rule is present in the field's rules
    const hasNumericRule = context.rules && context.rules.some(rule => rule.startsWith('numeric'));

    if (typeof value === 'string') {
        // If numeric rule is present, validate as number
        if (hasNumericRule) {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                return numValue >= min;
            }
        }
        // Otherwise validate string length
        return value.length >= min;
    }

    if (typeof value === 'number') {
        return value >= min;
    }

    if (Array.isArray(value)) {
        return value.length >= min;
    }

    if (value instanceof File) {
        return (value.size / 1024) >= min;
    }

    return true;
}
