// ref. https://www.npmjs.com/package/ical-generator
import * as ical from 'ical-generator';
import * as crypto from 'crypto';
import * as fs from 'fs';

const TARGET_FILE = 'docs/informatik1.ics';
const DOMAIN = 'schneefux.github.io'; // TODO config management

const sha256 = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

const cal = ical();

// TODO declare an interface
export function createEvent(event) {
    // TODO better duplicate detection and resolve conflicts lol
    const eventId = sha256(JSON.stringify(event)).substr(0, 16);

    const icalEvent = cal.createEvent({
        uid: eventId,
        start: event.start.dateTime,
        end: event.end.dateTime,
        timestamp: new Date(),
        summary: event.summary,
        description: event.description,
    });
}

export function commit() {
    fs.writeFile(TARGET_FILE, cal.toString(), (err) => {});
}
