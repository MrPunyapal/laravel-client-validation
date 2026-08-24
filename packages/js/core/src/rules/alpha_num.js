export default function alphaNum(value, params) {
  if (!value) return true;

  // Unicode letters and numbers by default (matches Laravel); the optional
  // 'ascii' parameter restricts matching to a-z/A-Z/0-9.
  const ascii = params && params.includes('ascii');

  if (ascii) {
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  return /^[\p{L}\p{M}\p{N}]+$/u.test(value);
}
