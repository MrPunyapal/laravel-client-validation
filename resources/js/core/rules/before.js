export default function before(value, [beforeDate]) {
    if (!value) return true;

    const date = new Date(value);
    const compareDate = new Date(beforeDate);

    if (isNaN(date.getTime()) || isNaN(compareDate.getTime())) {
        return false;
    }

    return date < compareDate;
}
