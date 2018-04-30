import {readFile} from 'fs';

import {ISource} from './ISource';

export class FileSource implements ISource {
    private _path: string;
    private _data: string = null;

    constructor(path: string) {
        this._path = path;
    }

    getData(): Promise<string> {
        if (this._data) {
            return Promise.resolve(this._data);
        }

        return new Promise<string>((resolve, reject) => {
            readFile(this._path, (err, data) => {
                if (err) return reject(err);

                this._data = data.toString();
                resolve(this._data);
            });
        });
    }
}
