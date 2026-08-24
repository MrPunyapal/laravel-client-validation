export default function min(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || params[0] === undefined) return false;
  if (!value && value !== 0) return true;

  const min = Number(params[0]);

  // Laravel evaluates the value numerically when a numeric/integer rule is
  // present on the same field; otherwise strings compare by character length.
  const hasNumericRule = Array.isArray(context.rules) &&
    context.rules.some(rule => /^(numeric|integer)/.test(String(rule)));

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
