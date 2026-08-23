export default function notIn(value, params) {
  if (!Array.isArray(params)) return false;

  // Empty values are left to `required`; everything else must stay outside
  // the list (arrays are joined with ',' mirroring Laravel's implode(',')).
  if (value === null || value === undefined || value === '') return true;

  return !params.includes(String(value));
}
