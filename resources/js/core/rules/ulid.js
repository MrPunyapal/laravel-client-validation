export default function ulid(value) {
    if (value === null || value === undefined || value === '') return true;

    const ulidPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;
    return ulidPattern.test(String(value));
}
