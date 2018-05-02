import {ISink} from './sinks/ISink';
import {ILectureFilter} from './core/ILecture';

import {IcalSink} from './sinks/IcalSink';

export interface SplusConfig {
    course: string;
    sink: ISink;

    lectureFilter?: ILectureFilter;
}

export const config: SplusConfig = {
    course: '#SPLUS7A3292',
    sink: new IcalSink('docs/informatik1.ics'),

    lectureFilter: lecture => {
        // Filter some lectures out
        if (lecture.title === '') return false;
        if (lecture.title.indexOf('Mathe-Cafe') !== -1) return false;
        if (lecture.title.indexOf('Mathe-Repetitorium') !== -1) return false;
        if (lecture.title.indexOf('Informatik-Lounge') !== -1) return false;
        if (lecture.title.indexOf('Grundlagen des Programmierens') !== -1) return false;
        if (lecture.title.indexOf('Reservierung') !== -1) return false;
        return lecture.title.indexOf('Kompetenzen') === -1;
    }
};
