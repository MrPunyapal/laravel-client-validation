export default function inArrayRule(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || !params[0]) return false;
  const [otherField] = params;
  const allData = context.allData || {};

  const cleanField = otherField.replace(/\.\*$/, '');
  const otherValue = allData[cleanField];

  if (!Array.isArray(otherValue)) return false;

  return otherValue.map(v => String(v)).includes(String(value));
}
