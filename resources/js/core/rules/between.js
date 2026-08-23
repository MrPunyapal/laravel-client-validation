export default function between(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length < 2 || params[1] === undefined) return false;
  if (!value && value !== 0) return true;

  const minimum = Number(params[0]);
  const maximum = Number(params[1]);

  // Laravel evaluates the value numerically when a numeric/integer rule is
  // present on the same field; otherwise strings compare by character length.
  const hasNumericRule = Array.isArray(context.rules) &&
    context.rules.some(rule => /^(numeric|integer)/.test(String(rule)));

  if (typeof value === 'string') {
    if (hasNumericRule) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue >= minimum && numValue <= maximum;
      }
    }
    return value.length >= minimum && value.length <= maximum;
  }

  if (typeof value === 'number') {
    return value >= minimum && value <= maximum;
  }

  if (Array.isArray(value)) {
    return value.length >= minimum && value.length <= maximum;
  }

  if (value instanceof File) {
    const sizeInKB = value.size / 1024;
    return sizeInKB >= minimum && sizeInKB <= maximum;
  }

  return false;
}
