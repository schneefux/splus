import * as moment from 'moment';
import * as BPromise from 'bluebird';
import * as fs from 'fs';

import {SplusApi} from './core/SplusApi';
import {IEvent} from './core/IEvent';
import {ILecture} from './core/ILecture';
import {IcalSink} from './sinks/IcalSink';
import {GoogleCalendarSink} from './sinks/GoogleCalendarSink';

const range = (upper: number): number[] => Array.from(Array(upper), (x, i) => i);
const xprod = (arr1, arr2) => [].concat(...arr1.map((e1) => arr2.map((e2) => [e1, e2])));
const isIncluded = (s1) => (s2) => s1.includes(s2);
const anyTrue = (arr, cond) => arr.filter(cond).length > 0;

async function main(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const sink = config.icsPath == undefined? new GoogleCalendarSink() : new IcalSink(config.icsPath);

    const baseDate = moment().startOf('week');

    await BPromise.map(xprod(config.courses, range(config.prefetchWeeks)), async ([course, weeksAhead]) => {
        const unfilteredLectures = await SplusApi.getData(course, baseDate.weeks() + weeksAhead);
        const lectures = unfilteredLectures.filter(lecture => anyTrue(config.titleWhitelist, isIncluded(lecture.title)));

        await BPromise.map(lectures, async (lec: ILecture) => {
            let beginDate = baseDate.clone();
            beginDate.add(moment.duration({
                days: lec.day + 1, // for moment: 1 = Monday
                hours: lec.begin,
                weeks: weeksAhead,
            }));

            let endDate = baseDate.clone();
            endDate.add(moment.duration({
                days: lec.day + 1,
                hours: lec.end,
                weeks: weeksAhead,
            }));
            const event: IEvent = {
                summary: lec.title,
                description: lec.lecturer + (lec.info !== '' ? ' - ' : '') + lec.info,
                location: lec.room,
                start: beginDate.toDate(),
                end: endDate.toDate(),
            };

            await sink.createEvent(event);

            console.log(lec.title, beginDate.toISOString(), endDate.toISOString());
        });
    });

    await sink.commit();
}

main(process.env.SPLUS_CONFIG || process.argv[2] || './config-example.json').catch(console.log);
