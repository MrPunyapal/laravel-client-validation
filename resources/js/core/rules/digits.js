export default function digits(value, params) {
  if (!Array.isArray(params) || params.length === 0) return false;

  // Laravel: numeric value with an exact character length.
  // Non-digit characters always fail - they are never stripped.
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return false;
    value = String(value);
  }

  if (typeof value !== 'string' || value === '') return false;

  const expected = parseInt(params[0], 10);
  if (isNaN(expected)) return false;

  return /^\d+$/.test(value) && value.length === expected;
}
