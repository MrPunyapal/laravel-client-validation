export default function url(value) {
    if (!value) return true;

    try {
        const urlObject = new URL(value);
        return ['http:', 'https:', 'ftp:', 'ftps:'].includes(urlObject.protocol);
    } catch {
        return false;
    }
}
