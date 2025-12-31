export default function active_url(value) {
    if (value === null || value === undefined || value === '') return true;

    try {
        const url = new URL(String(value));
        return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.');
    } catch {
        return false;
    }
}
