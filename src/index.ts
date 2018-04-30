import {readFile} from 'fs';
import {SplusParser} from './SplusParser';
let createEvent = (arg) => {};
let commit = () => {};
if (process.argv.includes('ics')) {
    createEvent = require('./ICal').createEvent;
    commit = require('./ICal').commit;
} else {
    createEvent = require('./GoogleCalendar').createEvent;
}


const splusUrl = 'http://splus.ostfalia.de/semesterplan123.php?id=1362F014835FFFD0F67159E302EC1A3C&identifier=%23SPLUS7A3292';

/*
get(splusUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => TODO);
});
*/

const baseDate = new Date(2018, 3, 23);

readFile('etc/sample.htm', (err, data) => {
    const lectures = new SplusParser(data.toString()).getLectures(lecture => {
        // Filter some lectures out
        if (lecture.title === '') return false;
        if (lecture.title.indexOf('Mathe-Cafe') !== -1) return false;
        if (lecture.title.indexOf('Mathe-Repetitorium') !== -1) return false;
        if (lecture.title.indexOf('Informatik-Lounge') !== -1) return false;
        if (lecture.title.indexOf('Reservierung') !== -1) return false;
        return lecture.title.indexOf('Kompetenzen') === -1;
    });

    lectures.forEach((lec, index) => {
        let beginDate = new Date(baseDate);

        beginDate.setDate(beginDate.getDate() + lec.day);
        beginDate.setMinutes(beginDate.getMinutes() + lec.begin * 60);

        let endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() + lec.day);
        endDate.setMinutes(endDate.getMinutes() + lec.end * 60);

        console.log(lec.title, beginDate.toISOString(), endDate.toISOString());

        createEvent({
            summary: lec.title,
            description: lec.lecturer + (lec.info !== '' ? ' - ' : '') + lec.info,
            location: lec.room,
            start: {
                dateTime: beginDate.toISOString()
            },
            end: {
                dateTime: endDate.toISOString()
            },
            reminders: {
                useDefault: false
            }
        });

        // TODO
        if (index == lectures.length - 1) {
            commit();
        }
    })
});

