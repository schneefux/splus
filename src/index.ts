import * as moment from 'moment';

import {config} from './config';
import {SplusApi} from './core/SplusApi';
import {IEvent} from './core/IEvent';

async function main() {
    const baseDate = moment().startOf('week');
    const unfilteredLectures = await SplusApi.getData(config.course, baseDate.weeks());
    const lectures = unfilteredLectures.filter(config.lectureFilter);

    for (let i = 0; i < lectures.length; i++) {
        const lec = lectures[i];

        let beginDate = baseDate.clone();
        beginDate.add(moment.duration({
            days: lec.day + 1, // for moment: 1 = Monday
            hours: lec.begin,
        }));

        let endDate = baseDate.clone();
        endDate.add(moment.duration({
            days: lec.day + 1,
            hours: lec.end,
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
    }

    await config.sink.commit();
}

main();
