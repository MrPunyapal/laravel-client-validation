export default function multipleOf(value, params) {
  if (!Array.isArray(params) || params.length === 0 || params[0] === undefined) return false;
  if (!value && value !== 0) return true;

  const num = Number(value);
  const div = Number(params[0]);

  if (isNaN(num) || isNaN(div) || div === 0) return false;

  const result = num / div;
  return Number.isInteger(result);
}
