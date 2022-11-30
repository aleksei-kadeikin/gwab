import { COOKIE, DATES, YEAR, WEEK} from './consts.js';
import fetch from 'node-fetch';
import cookie from 'cookie';

let XSRF_TOKEN = '';

const dataFetch = async () =>  {
    const response = await fetch(`https://goworkabit.com/workbiter/dashboard/calendar?year=${YEAR}&week=${WEEK}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            COOKIE
        }
    }
    );
    const json = await response.json();
    setToken(response);
    return json;
};

async function findShifts(dates = DATES, sShifts = [], data, canAdjust = true) {
    if(data === undefined) data = await dataFetch();

    const shifts = data.data.work_surfs.data[0].periods.data.filter(x => x.status === 'open')
    
    let longestS;
    
    sShifts.push(shifts.filter((shift) => {
        const start = new Date(shift.start_date);
        const end = new Date(shift.end_date);

        if (dates.some((date) => start >= date.start_date && end <= date.end_date) && (longestS === undefined ||
            new Date(longestS.start_date).getDate() !== start.getDate() ||
            end - start > new Date(longestS.end_date) - new Date(longestS.start_date))) {

            longestS = shift;
            return true;
        } else return false;
    }))
    
    const shiftsOnSameDay = sShifts.filter(e => lookup(sShifts)[new Date(e.start_date).toString().slice(0, 10)]);
    if(shiftsOnSameDay.length) {
        const toDelete = new Set(shiftsOnSameDay.map(x => x.id));
        sShifts = sShifts.filter(x => !toDelete.has(x.id));
        const longestShift = max(shiftsOnSameDay);
        sShifts.push(longestShift);
    }

    sShifts = sShifts.flat();

    if(sShifts.length != DATES.length && canAdjust) {
        const pickedDates = sShifts.map(x => new Date(x.start_date));
        const filledDates = dates.filter(date => pickedDates.some(x => x.getDate() === date.start_date.getDate()));
        const missingDates = dates.filter(date => !filledDates.includes(date));
        const adjustedDates = missingDates.map(x => {
            return {end_date: x.end_date, start_date: new Date(x.start_date.setHours(x.start_date.getHours() - 1))};
        })
        return findShifts(adjustedDates, sShifts, data, false);
    }

    return sShifts;
};

const lookup = shifts => shifts.reduce((a, e) => {
    a[new Date(e.start_date).toString().slice(0, 10)] = ++a[new Date(e.start_date).toString().slice(0, 10)] || 0;
    return a;
  }, {});
const max = data => data.reduce((prev, current) => ((new Date(prev.end_date).getTime() - new Date(prev.start_date).getTime()) > (new Date(current.end_date).getTime() - new Date(current.start_date).getTime())) ? prev : current)

async function pickShifts(shifts = []) {
    shifts.forEach(async (shift) => {
        console.log(`https://goworkabit.com/workbiter/work-surf/229/schedule/project/${shift.project_id}/period/${shift.id}`);
        const response = await shiftRequest(shift);
        setToken(response);
    })
}

const shiftRequest = shift => new Promise(resolve => resolve(fetch(`https://goworkabit.com/workbiter/work-surf/229/schedule/project/${shift.project_id}/period/${shift.id}`, {
    method: 'POST',
    headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,et;q=0.7,ru;q=0.6",
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        COOKIE,
        "x-xsrf-token": XSRF_TOKEN,
        "Referer": "https://goworkabit.com/app/worker/dashboard",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
})));

function setToken(response){
    console.log(response.status, response.statusText);
    XSRF_TOKEN = cookie.parse(response.headers.get('set-cookie'))['XSRF-TOKEN'];
}

async function a() {
    const shifts = await findShifts();
    shifts.forEach((x) => console.log(x.start_date, x.end_date));
    await pickShifts(shifts);
}

a();
