import * as moment from 'moment';
import * as BPromise from 'bluebird';

import {config} from './config';
import {SplusApi} from './core/SplusApi';
import {IEvent} from './core/IEvent';
import {ILecture} from './core/ILecture';

const range = (upper: number): number[] => Array.from(Array(upper), (x, i) => i)

async function main(configCourse, configPrefetchWeeks, configFilter) {
    const baseDate = moment().startOf('week');

    await BPromise.map(range(configPrefetchWeeks), async weeksAhead => {
        const unfilteredLectures = await SplusApi.getData(configCourse, baseDate.weeks() + weeksAhead);
        const lectures = unfilteredLectures.filter(configFilter);

        await BPromise.map(lectures, async lec => {
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

            await config.sink.createEvent(event);

            console.log(lec.title, beginDate.toISOString(), endDate.toISOString());
        });
    });

    await config.sink.commit();
}

main(config.course, config.prefetchWeeks, config.lectureFilter).catch(console.log);
