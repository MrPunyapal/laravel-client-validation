export default function inArray(value, params) {
  if (!Array.isArray(params)) return false;

  // Empty values are left to `required`; everything else is compared as a
  // string. Arrays are joined with ',' mirroring Laravel's implode(',') quirk.
  if (value === null || value === undefined || value === '') return true;

  return params.includes(String(value));
}
