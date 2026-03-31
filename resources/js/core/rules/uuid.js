export default function uuid(value, params) {
    if (!value) return true;

    const version = params && params[0] ? parseInt(params[0], 10) : null;

    if (version) {
        const versionPattern = new RegExp(
            `^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, 'i'
        );
        return versionPattern.test(value);
    }

    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return pattern.test(value);
}
