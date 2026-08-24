export default function digits_between(value, params) {
  if (!Array.isArray(params) || params.length < 2) return false;

  // Laravel: numeric value whose character length is between min and max.
  // Non-digit characters always fail - they are never stripped.
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return false;
    value = String(value);
  }

  if (typeof value !== 'string' || value === '') return false;

  const min = parseInt(params[0], 10);
  const max = parseInt(params[1], 10);
  if (isNaN(min) || isNaN(max)) return false;

  return /^\d+$/.test(value) && value.length >= min && value.length <= max;
}
