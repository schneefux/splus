import * as fs from 'fs';
import * as readline from 'readline';
import {google} from "googleapis";

const OAuth2Client = google.auth.OAuth2;
const scopes = ['https://www.googleapis.com/auth/calendar'];

const credentialsPath = 'client_secret.json';
const tokenPath = 'credentials.json';

export const clientPromise = new Promise((resolve, reject) => {
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

export const calendarPromise = clientPromise.then(auth => google.calendar({version: 'v3', auth}));


export async function listEvents() {
    const calendar = await calendarPromise;
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, data) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = data.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}

export function createEvent(event, calendarId = 'primary') {
    return calendarPromise.then(calendar => {
        return new Promise((resolve, reject) => {
            calendar.events.insert({
                calendarId: calendarId,
                resource: event,
            }, function (err, event) {
                if (err) return reject(err);
                resolve(event);
            });
        })
    });
}
