export default function mimetypes(value, params) {
    if (!value) return true;

    const f = value instanceof FileList ? value[0] : value;
    if (!f || typeof f !== 'object' || !f.type) return false;

    return params.some(allowed => {
        if (allowed.endsWith('/*')) {
            const category = allowed.slice(0, -2);
            return f.type.startsWith(category + '/');
        }
        return f.type === allowed;
    });
}
