export default function decimal(value, params = []) {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value === 'boolean') return false;

  const str = String(value);

  const [minParam, maxParam] = Array.isArray(params) ? params : [];

  if (minParam === undefined) {
    // No parameters (package extension): any decimal number.
    return /^[+-]?\d*\.?\d+$/.test(str);
  }

  // Package extension: a single parameter means "exactly N decimal places",
  // i.e. the same pattern as Laravel with min = max.
  const min = parseInt(minParam, 10);
  const max = maxParam !== undefined ? parseInt(maxParam, 10) : min;
  if (isNaN(min) || isNaN(max)) return false;

  // Mirrors Laravel: /^[+-]?\d*\.?\d{min,max}$/
  return new RegExp(`^[+-]?\\d*\\.?\\d{${min},${max}}$`).test(str);
}
