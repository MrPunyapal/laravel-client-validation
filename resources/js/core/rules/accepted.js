export default function accepted(value) {
    return value === 'yes' ||
           value === 'on' ||
           value === '1' ||
           value === 1 ||
           value === true ||
           value === 'true';
}
