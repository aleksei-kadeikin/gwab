import { COOKIE, YEAR, WEEK } from '../consts.js';
import fetch from 'node-fetch';
import cookie from 'cookie';

let XSRF_TOKEN = '';

export const fetchData = async () => {
    const response = await fetch(
        `https://goworkabit.com/workbiter/dashboard/calendar?year=${YEAR}&week=${WEEK}`,
        {
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

export async function pickShifts(shifts = []) {
    shifts.forEach(async (shift) => {
        console.log(
            `https://goworkabit.com/workbiter/work-surf/229/schedule/project/${shift.project_id}/period/${shift.id}`
        );
        const response = await shiftRequest(shift);
        setToken(response);
    });
}

const shiftRequest = (shift) =>
    new Promise((resolve) =>
        resolve(
            fetch(
                `https://goworkabit.com/workbiter/work-surf/229/schedule/project/${shift.project_id}/period/${shift.id}`,
                {
                    method: 'POST',
                    headers: {
                        accept: 'application/json, text/plain, */*',
                        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,et;q=0.7,ru;q=0.6',
                        'sec-ch-ua':
                            '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"macOS"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest',
                        COOKIE,
                        'x-xsrf-token': XSRF_TOKEN,
                        Referer: 'https://goworkabit.com/app/worker/dashboard',
                        'Referrer-Policy': 'strict-origin-when-cross-origin'
                    }
                }
            )
        )
    );

function setToken(response) {
    console.log(response.status, response.statusText);
    XSRF_TOKEN = cookie.parse(response.headers.get('set-cookie'))['XSRF-TOKEN'];
}
