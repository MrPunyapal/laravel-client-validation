export default function missingWithAll(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0) return true;
  const allData = context.allData || {};

  const allPresent = params.every(f => allData[f] !== undefined);

  if (!allPresent) return true;

  return value === undefined;
}
