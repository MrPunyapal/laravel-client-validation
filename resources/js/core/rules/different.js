export default function different(value, [otherField], field, data = {}) {
    return value !== data[otherField];
}
