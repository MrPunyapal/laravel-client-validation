export default function extensions(value, params) {
    if (!value) return true;

    const f = value instanceof FileList ? value[0] : value;
    if (!f || typeof f !== 'object' || !f.name) return false;

    const ext = f.name.split('.').pop().toLowerCase();
    return params.map(p => p.toLowerCase()).includes(ext);
}
