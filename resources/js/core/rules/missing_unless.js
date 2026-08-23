export default function missingUnless(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length < 2) return true;
  const [otherField, ...expectedValues] = params;
  const allData = context.allData || {};
  const otherValue = String(allData[otherField] ?? '');

  const allowed = expectedValues.some(v => String(v) === otherValue);

  if (allowed) return true;

  return value === undefined;
}
