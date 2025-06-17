export default function same(value, [otherField], field, data = {}) {
    return value === data[otherField];
}
