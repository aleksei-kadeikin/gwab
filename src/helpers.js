export function getOpenShifts(data) {
    return data.filter((x) => x.status === 'open');
}

export function getUniqueStartDates(shifts, dates) {
    return Array.from(
        new Set(
            shifts
                .filter((shift) =>
                    dates.some(
                        (date) =>
                            new Date(shift.start_date) >= date.start_date &&
                            new Date(shift.end_date) <= date.end_date
                    )
                )
                .map((x) => x.start_date)
        )
    );
}

export function getLongestShiftsByStartDates(uniqueStartDates, flattenedShifts, dates) {
    return new Map(
        uniqueStartDates.map((date) => {
            const filteredShifts = filterFlattenedShifts(flattenedShifts, date, dates);
            return [getOnlyDate(date), getLongestShift(filteredShifts)];
        })
    );
}

function filterFlattenedShifts(flattenedShifts, date, dates) {
    return flattenedShifts.filter((shift) => {
        const shiftStart = getOnlyDate(shift.start_date);
        return (
            shiftStart === getOnlyDate(date) &&
            dates.some((dateRange) => {
                return (
                    new Date(shift.start_date).getTime() >= dateRange.start_date.getTime() &&
                    dateRange.end_date >= new Date(shift.end_date)
                );
            })
        );
    });
}

export function getShiftsByStartDate(openShifts, uniqueStartDates) {
    return new Map(
        uniqueStartDates.map((date) => [
            date,
            openShifts.filter((shift) => shift.start_date === date)
        ])
    );
}

function getLongestShift(dates) {
    if (!dates.length) return null;

    let longest = 0;
    let longestShift = null;

    dates.forEach((date) => {
        const start = new Date(date.start_date);
        const end = new Date(date.end_date);

        const diff = Math.abs(start - end);

        if (
            diff > longest ||
            (isFridayShift(date) &&
                diff === longest &&
                new Date(longestShift.end_date) < new Date(date.end_date))
        ) {
            longest = diff;
            longestShift = date;
        }
    });

    return longestShift;
}

function isFridayShift(date) {
    const startOnFriday = new Date(date.start_date).getDay() === 5;
    const finishOnSaturday = new Date(date.end_date).getDay() === 6;
    return startOnFriday && finishOnSaturday;
}

export function getOnlyDate(date) {
    return date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString();
}
