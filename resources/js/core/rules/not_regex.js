import { buildPattern } from './build_pattern.js';

export default function notRegex(value, params) {
  if (!value) return true;

  const { pattern, flags } = buildPattern(params);
  if (!pattern) return false;

  try {
    return !new RegExp(pattern, flags).test(String(value));
  } catch (e) {
    console.warn('Invalid regex pattern:', pattern);
    return false;
  }
}
