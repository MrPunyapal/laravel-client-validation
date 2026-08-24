export default function min_digits(value, params) {
  if (value === null || value === undefined || value === '') return true;

  if (!Array.isArray(params) || params.length === 0 || isNaN(parseInt(params[0], 10))) {
    return false;
  }
  const min = parseInt(params[0], 10);

  // Laravel requires an all-digit value; non-digits fail instead of being stripped.
  const strValue = typeof value === 'number' ? String(value) : value;
  if (typeof strValue !== 'string' || !/^\d+$/.test(strValue)) return false;

  return strValue.length >= min;
}
