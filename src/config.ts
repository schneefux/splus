import {ISource} from './sources/ISource';
import {ISink} from './sinks/ISink';
import {ILectureFilter} from './core/ILecture';

import {HttpSource} from './sources/HttpSource';
import {IcalSink} from './sinks/IcalSink';

export interface SplusConfig {
    source: ISource;
    sink: ISink;

    lectureFilter?: ILectureFilter;
}

export const config: SplusConfig = {
    source: new HttpSource('http://splus.ostfalia.de/semesterplan123.php?id=1362F014835FFFD0F67159E302EC1A3C&identifier=%23SPLUS7A3292'),
    sink: new IcalSink('out.ics'),

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
