/**
 * Shared helpers for date rules (after, before, *_or_equal, date_equals).
 */

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Resolve a date rule parameter into a Date object.
 *
 * Supported, in order of precedence:
 *  1. another field name present in the submitted data (e.g. `after:end_date`)
 *  2. Laravel-style relative keywords: today, tomorrow, yesterday
 *     (each resolved to local midnight, like PHP's strtotime)
 *  3. any absolute date string parseable by `new Date()`
 *
 * Returns null when the parameter cannot be resolved to a valid date.
 */
export function resolveDateParam(param, allData = {}) {
  const data = allData || {};

  if (param !== undefined && param !== null && Object.prototype.hasOwnProperty.call(data, param)) {
    const fieldValue = data[param];
    if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
      return null;
    }
    const parsed = new Date(fieldValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const now = new Date();
  switch (String(param).toLowerCase()) {
    case 'today':
      return startOfDay(now);
    case 'tomorrow':
      return startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    case 'yesterday':
      return startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }

  const parsed = new Date(param);
  return isNaN(parsed.getTime()) ? null : parsed;
}
