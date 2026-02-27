export default function presentWithAll(value, params, field, context = {}) {
    const allData = context.allData || {};

    const allPresent = params.every(f => allData[f] !== undefined);

    if (!allPresent) return true;

    return value !== undefined;
}
