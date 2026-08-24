export default function ascii(value) {
  if (!value) return true;
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(value);
}
