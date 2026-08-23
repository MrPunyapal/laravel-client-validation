export default function date(value) {
  if (value === null || value === undefined || value === '') return true;

  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }

  // Only strings are valid date input from forms. JS `new Date()` would
  // silently accept numbers/booleans as epoch timestamps, which Laravel
  // (strtotime-based) rejects.
  if (typeof value !== 'string') return false;

  const parsed = new Date(value);
  return !isNaN(parsed.getTime());
}
