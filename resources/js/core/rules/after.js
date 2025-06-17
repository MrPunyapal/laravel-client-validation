export default function after(value, [afterDate]) {
    if (!value) return true;

    const date = new Date(value);
    const compareDate = new Date(afterDate);

    if (isNaN(date.getTime()) || isNaN(compareDate.getTime())) {
        return false;
    }

    return date > compareDate;
}
