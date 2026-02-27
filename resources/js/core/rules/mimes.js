const MIME_MAP = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    bmp: 'image/bmp', webp: 'image/webp', svg: 'image/svg+xml',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip', rar: 'application/x-rar-compressed',
    tar: 'application/x-tar', gz: 'application/gzip',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    mp4: 'video/mp4', avi: 'video/x-msvideo', mov: 'video/quicktime',
    txt: 'text/plain', csv: 'text/csv', html: 'text/html',
    json: 'application/json', xml: 'application/xml',
};

export default function mimes(value, params) {
    if (!value) return true;

    const f = value instanceof FileList ? value[0] : value;
    if (!f || typeof f !== 'object') return false;

    const allowedMimes = params.map(ext => MIME_MAP[ext.toLowerCase()] || `application/${ext}`);

    if (f.type && allowedMimes.includes(f.type)) return true;

    if (f.name) {
        const ext = f.name.split('.').pop().toLowerCase();
        return params.map(p => p.toLowerCase()).includes(ext);
    }

    return false;
}
