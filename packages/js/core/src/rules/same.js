export default function same(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || !params[0]) return false;

  const otherField = params[0];
  const allData = context.allData || context;
  return value === allData[otherField];
}
