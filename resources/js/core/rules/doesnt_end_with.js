export default function doesntEndWith(value, params) {
    if (!value) return true;
    const str = String(value);
    return !params.some(suffix => str.endsWith(suffix));
}
