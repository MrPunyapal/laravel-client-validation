export default function contains(value, params) {
  if (!Array.isArray(value)) return false;
  if (!Array.isArray(params) || params.length === 0) return false;

  const stringValues = value.map(v => String(v));
  return params.every(param => stringValues.includes(String(param)));
}
