export default function enumRule(value, params) {
  if (!Array.isArray(params)) return false;

  // Empty values are left to `required`; everything else must be in the list.
  if (value === null || value === undefined || value === '') return true;

  return params.map(v => String(v)).includes(String(value));
}
