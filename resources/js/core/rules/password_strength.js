export default function passwordStrength(value, params) {
    if (!value) return true;

    const str = String(value);
    const config = parsePasswordParams(params);

    if (config.min && str.length < config.min) return false;
    if (config.letters && !/[a-zA-Z]/.test(str)) return false;
    if (config.mixedCase && (!/[a-z]/.test(str) || !/[A-Z]/.test(str))) return false;
    if (config.numbers && !/\d/.test(str)) return false;
    if (config.symbols && !/[^a-zA-Z0-9]/.test(str)) return false;

    return true;
}

function parsePasswordParams(params) {
    const config = { min: 8 };

    if (!params || params.length === 0) return config;

    for (const param of params) {
        const [key, val] = param.split('=');
        switch (key) {
            case 'min': config.min = parseInt(val || '8', 10); break;
            case 'letters': config.letters = true; break;
            case 'mixed': case 'mixedCase': config.mixedCase = true; break;
            case 'numbers': config.numbers = true; break;
            case 'symbols': config.symbols = true; break;
        }
    }

    return config;
}
