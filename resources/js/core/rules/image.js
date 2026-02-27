const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'svg'];
const IMAGE_MIMES = [
    'image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp', 'image/svg+xml'
];

export default function image(value, params = []) {
    if (!value) return true;

    const allowSvg = params.includes('allow_svg');
    const extensions = allowSvg ? IMAGE_EXTENSIONS : IMAGE_EXTENSIONS.filter(e => e !== 'svg');
    const mimes = allowSvg ? IMAGE_MIMES : IMAGE_MIMES.filter(m => m !== 'image/svg+xml');

    const f = value instanceof FileList ? value[0] : value;
    if (!f || typeof f !== 'object') return false;

    if (f.type && mimes.includes(f.type)) return true;

    if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return extensions.includes(ext);
    }

    return false;
}
