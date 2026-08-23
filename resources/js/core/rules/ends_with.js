export default function endsWith(value, suffixes) {
  if (!value) return true;
  if (typeof value !== 'string') return false;
  if (!Array.isArray(suffixes) || suffixes.length === 0) return false;
  return suffixes.some(suffix => value.endsWith(suffix));
}
