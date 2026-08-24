export default function max(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || params[0] === undefined) return false;
  if (!value && value !== 0) return true;

  const max = Number(params[0]);

  // Laravel evaluates the value numerically when a numeric/integer rule is
  // present on the same field; otherwise strings compare by character length.
  const hasNumericRule = Array.isArray(context.rules) &&
    context.rules.some(rule => /^(numeric|integer)/.test(String(rule)));

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
