export function getLongestShift(dates) {
    if (!dates.length) return null;
    
    let longest = 0;
    let longestShift = null;
    
    dates.forEach(date => {
        const start = new Date(date.start_date);
        const end = new Date(date.end_date);

        const diff = Math.abs(start - end);

        if (diff > longest || (isFridayShift(date) && diff === longest && new Date(longestShift.end_date) < new Date(date.end_date))) {
            longest = diff;
            longestShift = date;
        }
    });

    return longestShift;
}  

function isFridayShift(date) {
    const startOnFriday = (new Date(date.start_date)).getDay() === 5;
    const finishOnSaturday = (new Date(date.end_date)).getDay() === 6;
    return startOnFriday && finishOnSaturday;
  }

export function getOnlyDate(date) {
    return date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString()
}
