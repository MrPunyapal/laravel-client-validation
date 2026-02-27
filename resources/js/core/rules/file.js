export default function file(value) {
    if (!value) return true;

    if (typeof File !== 'undefined' && value instanceof File) return true;
    if (typeof FileList !== 'undefined' && value instanceof FileList) return value.length > 0;

    return false;
}
