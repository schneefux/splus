import {ISink} from './sinks/ISink';
import {ILectureFilter} from './core/ILecture';

import {IcalSink} from './sinks/IcalSink';

export interface SplusConfig {
    courses: string[];
    sink: ISink;
    prefetchWeeks: number;

    lectureFilter?: ILectureFilter;
}

export const config: SplusConfig = {
    courses: ['#SPLUS7A3292', '#SPLUS7A3280'],
    sink: new IcalSink('kalender/informatik1.ics'),
    prefetchWeeks: 4,

    lectureFilter: (lecture) => {
        const whitelist = [
            'Programmieren',
            'Datenbanken',
            'Diskrete Strukturen',
            'Reservierung',
            'Einführung',
            'Grundlagen des Programmierens',
        ];
        const isIncluded = (s1) => (s2) => s1.includes(s2);
        const anyTrue = (arr, cond) => arr.filter(cond).length > 0;
        return anyTrue(whitelist, isIncluded(lecture.title));
    }
};
