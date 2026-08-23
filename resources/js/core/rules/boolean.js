// Laravel only accepts true, false, 1, 0, '1' and '0'. The extra string
// forms below ('true', 'false', 'on') are deliberate package extensions for
// HTML checkbox/API payloads; the core six are always accepted.
export default function boolean(value, params) {
  if (value === null || value === undefined || value === '') return true;

  const strict = params && params.includes('strict');

  if (strict) {
    return value === true || value === false;
  }

  const acceptedValues = [true, false, 1, 0, '1', '0', 'true', 'false', 'on'];
  return acceptedValues.includes(value);
}
