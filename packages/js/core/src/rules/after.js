import { resolveDateParam } from './date_utils.js';

export default function after(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0) return false;
  if (!value) return true;

  const date = new Date(value);
  const compareDate = resolveDateParam(params[0], context.allData);

  if (isNaN(date.getTime()) || !compareDate) {
    return false;
  }

  return date.getTime() > compareDate.getTime();
}
