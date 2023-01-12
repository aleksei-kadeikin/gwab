import { getOnlyDate, getLongestShift } from './helpers.js';
import { DATES } from '../consts.js';
import { fetchData } from './api.js';

export async function findShifts(dates = DATES, data, adjust = true) {
    if(data === undefined) data = await fetchData();

    const shifts = data.data.work_surfs.data[0].periods.data.filter(x => x.status === 'open');
    const startDatesWTimes = Array.from(new Set(shifts.filter((shift) => dates.some((date) => new Date(shift.start_date) >= date.start_date && new Date(shift.end_date) <= date.end_date)).map(x =>x.start_date)));
    const shiftsMapWTimes = Array.from(new Map(startDatesWTimes.map(date => [date, shifts.filter(shift => shift.start_date === date)])).values()).flat()
    const startDates = new Map(startDatesWTimes.map(date => [getOnlyDate(date), shiftsMapWTimes.filter(shift => getOnlyDate(date) === getOnlyDate(shift.start_date) && dates.some(date => date.end_date.getTime() === new Date(shift.end_date).getTime() && date.end_date.getTime() >= new Date(shift.end_date).getTime()))]));

    startDates.forEach((value, key) => {
        startDates.set(key, getLongestShift(value));
    })
    
    let missingDates = DATES.map(x => getOnlyDate(x.start_date)).filter(x => !Array.from(startDates.keys()).includes(x));
    if (missingDates.length && adjust) {
        const datesForSearch = DATES.filter(date => missingDates.includes(getOnlyDate(date.start_date)));
        datesForSearch.forEach(date => date.start_date.setHours(date.start_date.getHours() - 1));
        return Array.from(startDates.values()).concat(await findShifts(datesForSearch, data, false));
    }

    return Array.from(startDates.values());
};
