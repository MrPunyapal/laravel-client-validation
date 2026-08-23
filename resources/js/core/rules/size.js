export default function size(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || params[0] === undefined) return false;
  if (!value && value !== 0) return true;

  const expectedSize = Number(params[0]);

  // Laravel evaluates the value numerically when a numeric/integer rule is
  // present on the same field; otherwise strings compare by character length.
  const hasNumericRule = Array.isArray(context.rules) &&
    context.rules.some(rule => /^(numeric|integer)/.test(String(rule)));

  if (typeof value === 'string') {
    if (hasNumericRule) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue === expectedSize;
      }
    }
    return value.length === expectedSize;
  }

  if (typeof value === 'number') {
    return value === expectedSize;
  }

  if (Array.isArray(value)) {
    return value.length === expectedSize;
  }

  // Laravel compares the raw KB division (no rounding).
  if (value instanceof File) {
    return (value.size / 1024) === expectedSize;
  }

  return false;
}
