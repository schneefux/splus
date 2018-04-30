import * as fs from 'fs';
import * as readline from 'readline';

import {google} from 'googleapis';

import {ISink} from './ISink';
import {IEvent} from '../core/IEvent';


const OAuth2Client = google.auth.OAuth2;
const scopes = ['https://www.googleapis.com/auth/calendar'];

const credentialsPath = 'etc/google/client_secret.json';
const tokenPath = 'etc/google/credentials.json';

const clientPromise = new Promise((resolve, reject) => {
    fs.readFile(credentialsPath, (err, data) => {
        if (err) return reject(err);

        const credentials = JSON.parse(data.toString());
        const {client_secret, client_id, redirect_uris} = credentials.installed;

        const client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

        fs.readFile(tokenPath, (err, data) => {
            if (err) {
                const authUrl = client.generateAuthUrl({
                    access_type: 'offline',
                    scope: scopes,
                });

                console.log('Authorize this app by visiting this url:', authUrl);

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                rl.question('Enter the code from that page here: ', code => {
                    rl.close();
                    client.getToken(code, (err, token) => {
                        if (err) return reject(err);
                        fs.writeFile(tokenPath, JSON.stringify(token), err => err ? console.error(err) : 0);
                        client.setCredentials(token);
                        resolve(client);
                    });
                });
            }
            else {
                client.setCredentials(JSON.parse(data.toString()));
                resolve(client);
            }
        });
    });
});


const calendarPromise = clientPromise.then(auth => google.calendar({version: 'v3', auth}));


export class GoogleCalendarSink implements ISink {
    private _calendarId: string;

    constructor(calendarId = 'primary') {
        this._calendarId = calendarId;
    }

    createEvent(event: IEvent): Promise<void> {
        const googleEvent = {
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: {
                dateTime: event.start.toISOString()
            },
            end: {
                dateTime: event.end.toISOString()
            },
            reminders: {
                useDefault: false
            }
        };

        return calendarPromise.then(calendar => {
            return new Promise<void>((resolve, reject) => {
                calendar.events.insert({
                    calendarId: this._calendarId,
                    resource: googleEvent,
                }, function (err, event) {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

    commit(): Promise<void> {
        return Promise.resolve();
    }
}
