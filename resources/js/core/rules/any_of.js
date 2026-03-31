import RuleRegistry from '../RuleRegistry.js';

export default function anyOf(value, params, field, context = {}) {
    if (!value && value !== 0 && value !== false) return true;

    const rulesets = parseAnyOfParams(params);

    for (const ruleset of rulesets) {
        let allPassed = true;

        for (const ruleStr of ruleset) {
            const [name, ...paramParts] = ruleStr.split(':');
            const ruleParams = paramParts.length > 0 ? paramParts[0].split(',') : [];
            const validator = RuleRegistry.get(name);

            if (!validator) continue;

            if (!validator(value, ruleParams, field, context)) {
                allPassed = false;
                break;
            }
        }

        if (allPassed) return true;
    }

    return false;
}

function parseAnyOfParams(params) {
    if (!params || params.length === 0) return [];

    return params
        .join(',')
        .split(';')
        .map(group => group.split('|').map(r => r.trim()).filter(Boolean));
}
