import * as moment from 'moment';
import * as BPromise from 'bluebird';
import * as fs from 'fs';
import * as ical from 'ical-generator';

import {createHash} from 'crypto';

import {SplusApi} from './core/SplusApi';
import {ILecture} from './core/ILecture';

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');
const flatten = (arr) => [].concat(...arr);
const range = (upper: number): number[] => Array.from(Array(upper), (x, i) => i);
const xprod = (arr1, arr2) => flatten(arr1.map((e1) => arr2.map((e2) => [e1, e2])));
const isIncluded = (s1) => (s2) => s1.includes(s2);
const anyTrue = (arr, cond) => arr.filter(cond).length > 0;
const allFalse = (arr, cond) => !anyTrue(arr, cond);
const uniqueByKey = (arrOfObj, key) => flatten((new Map(arrOfObj.map(obj => [obj[key], obj]))).values());

async function main(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const baseDate = moment().startOf('week');

    const events = flatten(await BPromise.map(xprod(config.courses, range(config.prefetchWeeks)), async ([course, weeksAhead]) => {
        const week = baseDate.clone().add(weeksAhead, 'weeks').weeks();
        const unfilteredLectures = await SplusApi.getData(course, week);
        const lectures = unfilteredLectures.filter(lecture => allFalse(config.titleBlacklist, isIncluded(lecture.title)));
        console.log(`fetching course ${course} week ${week}, ${lectures.length} lectures found`);

        return lectures.map((lec: ILecture) => {
            const beginDate = baseDate.clone();
            beginDate.add(moment.duration({
                days: lec.day + 1, // for moment: 1 = Monday
                hours: lec.begin,
                weeks: weeksAhead,
            }));

            const endDate = baseDate.clone();
            endDate.add(moment.duration({
                days: lec.day + 1,
                hours: lec.end,
                weeks: weeksAhead,
            }));

            const uid = sha256(JSON.stringify({ lec, beginDate, endDate })).substr(0, 16);
            return {
                uid,
                start: beginDate.toDate(),
                end: endDate.toDate(),
                timestamp: moment().toDate(),
                summary: lec.title,
                description: lec.lecturer + (lec.info !== '' ? ' - ' : '') + lec.info,
                location: lec.room,
            };
        });
    }, { concurrency: 1 })); // splus session breaks when sending multiple concurrent calls

    // ref. https://www.npmjs.com/package/ical-generator
    const cal = ical({ domain: 'ostfalia.de', events: uniqueByKey(events, 'uid') }).timezone('UTC').toString();
    fs.writeFileSync(config.icsPath, cal.toString());
}

main(process.env.SPLUS_CONFIG || process.argv[2] || './config-example.json').catch(console.log);
