import {get} from 'http';

import {ISource} from './ISource';

export class HttpSource implements ISource {
    private _uri: string;

    constructor(path: string) {
        this._uri = path;
    }

    getData(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            get(this._uri, (res) => {
                let data = '';
                res.on('error', reject);
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
        });
    }
}
