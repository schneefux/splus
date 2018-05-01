import * as request from 'request-promise-native';

import {ISource} from './ISource';

export class HttpSource implements ISource {
    private _base_uri = 'http://splus.ostfalia.de/semesterplan123.php';

    constructor(private _course: string) {
    }

    getData(weekOfYear: number): PromiseLike<string> {
        return request({
            method: 'POST',
            uri: this._base_uri,
            qs: {
                identifier: this._course,
            },
            formData: {
                weeks: weekOfYear.toString(),
            },
        });
    }
}
