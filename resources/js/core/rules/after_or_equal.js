import { resolveDateParam } from './date_utils.js';

export default function afterOrEqual(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0) return false;
  if (!value) return true;

  const inputDate = new Date(value);
  const compareDate = resolveDateParam(params[0], context.allData);

  if (isNaN(inputDate.getTime()) || !compareDate) return false;

  // Compare calendar days, so date-only inputs compare predictably.
  inputDate.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);

  return inputDate >= compareDate;
}
