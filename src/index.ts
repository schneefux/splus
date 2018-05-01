import * as moment from 'moment';
import {SplusParser} from './core/SplusParser';

import {config} from './config';
import {IEvent} from './core/IEvent';

const baseDate = moment().startOf('week');

config.source.getData(baseDate.weeks()).then(async data => {
    const lectures = new SplusParser(data.toString()).getLectures(config.lectureFilter);

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
});
