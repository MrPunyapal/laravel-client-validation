export default function doesntEndWith(value, params) {
  if (!value) return true;
  const str = String(value);
  if (!Array.isArray(params) || params.length === 0) return true;
  return !params.some(suffix => str.endsWith(suffix));
}
