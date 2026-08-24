export default function integer(value, params) {
  if (!value && value !== 0) return true;

  const strict = Array.isArray(params) && params.includes('strict');

  if (strict) {
    return typeof value === 'number' && Number.isInteger(value);
  }

  if (typeof value === 'number') return Number.isInteger(value);

  if (typeof value !== 'string') return false;

  // Matches PHP's FILTER_VALIDATE_INT: digits only with optional sign.
  // Decimal notation ('5.0') and surrounding whitespace are rejected.
  return /^[+-]?\d+$/.test(value);
}
