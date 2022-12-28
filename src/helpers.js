export function getLongestShift(dates) {
    if (!dates.length) return null;
    
    let longest = 0;
    let longestShift = null;
    
    dates.forEach(date => {
        const start = new Date(date.start_date);
        const end = new Date(date.end_date);

        const diff = Math.abs(start - end);

        if (diff > longest || (isWeekend(new Date(date.end_date)) && diff === longest && new Date(longestShift.end_date) < new Date(date.end_date))) {
            longest = diff;
            longestShift = date;
        }
    });

    return longestShift;
}  

function isWeekend(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

export function getOnlyDate(date) {
    return date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString()
}
