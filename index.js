import { findShifts } from './src/main.js';
import { pickShifts } from './src/api.js';

async function run() {
    const shifts = await findShifts();
    shifts.length
        ? shifts.forEach((x) => console.log(x.start_date, x.end_date))
        : console.log('No shifts found');
    await pickShifts(shifts);
}

run();
