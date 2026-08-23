export default function prohibits(value, params, field, context = {}) {
  const allData = context.allData || {};
  const fields = Array.isArray(params) ? params : [];

  if (value === null || value === undefined || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;

  // No prohibited fields listed -> nothing to prohibit -> pass.
  return fields.every(f => {
    const other = allData[f];
    if (other === null || other === undefined || other === '') return true;
    if (Array.isArray(other)) return other.length === 0;
    return false;
  });
}
