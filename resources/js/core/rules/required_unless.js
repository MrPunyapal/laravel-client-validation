export default function requiredUnless(value, params, field, context = {}) {
  // No condition parameters -> exception applies vacuously -> not required.
  if (!Array.isArray(params) || params.length < 2) return true;
  const [otherField, ...expectedValues] = params;
  const allData = context.allData || {};
  const otherValue = String(allData[otherField] ?? '');

  const shouldBeRequired = !expectedValues.some(v => String(v) === otherValue);

  if (!shouldBeRequired) return true;

  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
