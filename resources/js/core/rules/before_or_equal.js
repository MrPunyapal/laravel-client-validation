export default function beforeOrEqual(value, [dateParam], field, context = {}) {
    if (!value) return true;

    const allData = context.allData || {};
    let compareDate;

    if (allData[dateParam]) {
        compareDate = new Date(allData[dateParam]);
    } else {
        compareDate = new Date(dateParam);
    }

    const inputDate = new Date(value);

    if (isNaN(inputDate.getTime()) || isNaN(compareDate.getTime())) return false;

    inputDate.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);

    return inputDate <= compareDate;
}
