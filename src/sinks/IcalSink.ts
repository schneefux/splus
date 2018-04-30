import {createHash} from 'crypto';
import {writeFile} from 'fs';

import * as ical from 'ical-generator';

import {ISink} from './ISink';
import {IEvent} from '../core/IEvent';


const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');


// ref. https://www.npmjs.com/package/ical-generator
export class IcalSink implements ISink {
    private _cal = ical();
    private _targetFile: string;

    constructor(targetFile: string) {
        this._targetFile = targetFile;
    }

    createEvent(event: IEvent): Promise<void> {
        // TODO better duplicate detection and resolve conflicts lol
        const eventId = sha256(JSON.stringify(event)).substr(0, 16);

        const icalEvent = this._cal.createEvent({
            uid: eventId,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            timestamp: new Date(),
            summary: event.summary,
            description: event.description,
        });

        return Promise.resolve();
    }

    commit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            writeFile(this._targetFile, this._cal.toString(), err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}
