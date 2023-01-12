import {
    getOpenShifts,
    getUniqueStartDates,
    getShiftsByStartDate,
    getLongestShiftsByStartDates,
    getOnlyDate
} from './helpers.js';
import { DATES } from '../consts.js';
import { fetchData } from './api.js';

export async function findShifts(data, dates = DATES, adjust = true) {
    if (data === undefined) data = await fetchData();

    const openShifts = getOpenShifts(data.data.work_surfs.data[0].periods.data);
    const uniqueStartDates = getUniqueStartDates(openShifts, dates);
    const shiftsByStartDate = getShiftsByStartDate(openShifts, uniqueStartDates);
    const flattenedShifts = Array.from(shiftsByStartDate.values()).flat();

    const longestShiftsByStartDate = getLongestShiftsByStartDates(
        uniqueStartDates,
        flattenedShifts,
        dates
    );

    const missingDates = DATES.map((x) => getOnlyDate(x.start_date)).filter(
        (x) => !Array.from(longestShiftsByStartDate.keys()).includes(x)
    );
    if (missingDates.length && adjust) {
        const datesForSearch = DATES.filter((date) =>
            missingDates.includes(getOnlyDate(date.start_date))
        );
        datesForSearch.forEach((date) => date.start_date.setHours(date.start_date.getHours() - 1));
        return Array.from(longestShiftsByStartDate.values()).concat(
            await findShifts(data, datesForSearch, false)
        );
    }

    return Array.from(longestShiftsByStartDate.values());
}
