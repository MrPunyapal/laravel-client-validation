export default function missingIf(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length < 2) return true;
  const [otherField, ...expectedValues] = params;
  const allData = context.allData || {};
  const otherValue = String(allData[otherField] ?? '');

  const shouldBeMissing = expectedValues.some(v => String(v) === otherValue);

  if (!shouldBeMissing) return true;

  return value === undefined;
}
