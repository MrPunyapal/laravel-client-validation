export default function presentWith(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0) return true;
  const allData = context.allData || {};

  const anyPresent = params.some(f => allData[f] !== undefined);

  if (!anyPresent) return true;

  return value !== undefined;
}
