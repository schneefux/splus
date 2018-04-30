import {SplusParser} from './core/SplusParser';

import {config} from './config';
import {IEvent} from './core/IEvent';

function getMonday(date: Date) {
    const day = date.getDay() || 7;
    if (day !== 1) {
        date.setHours(-24 * (day - 1));
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const baseDate = getMonday(new Date());

config.source.getData().then(async data => {
    const lectures = new SplusParser(data.toString()).getLectures(config.lectureFilter);

    for (let i = 0; i < lectures.length; i++) {
        const lec = lectures[i];

        let beginDate = new Date(baseDate);
        beginDate.setDate(beginDate.getDate() + lec.day);
        beginDate.setMinutes(beginDate.getMinutes() + lec.begin * 60);

        let endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() + lec.day);
        endDate.setMinutes(endDate.getMinutes() + lec.end * 60);

        const event: IEvent = {
            summary: lec.title,
            description: lec.lecturer + (lec.info !== '' ? ' - ' : '') + lec.info,
            location: lec.room,
            start: beginDate,
            end: endDate
        };

        await config.sink.createEvent(event);

        console.log(lec.title, beginDate.toISOString(), endDate.toISOString());
    }

    await config.sink.commit();
});
