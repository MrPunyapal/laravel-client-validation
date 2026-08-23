export default function lte(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || !params[0]) return false;
  if (!value && value !== 0) return true;

  const otherValue = context.allData?.[params[0]];
  if (otherValue === undefined) return false;

  // Laravel compares sizes: numerically when both sides are numeric,
  // otherwise by length for strings and item count for arrays.
  const numValue = Number(value);
  const numOther = Number(otherValue);

  if (!isNaN(numValue) && !isNaN(numOther)) {
    return numValue <= numOther;
  }

  if (typeof value === 'string' && typeof otherValue === 'string') {
    return value.length <= otherValue.length;
  }

  if (Array.isArray(value) && Array.isArray(otherValue)) {
    return value.length <= otherValue.length;
  }

  return false;
}
