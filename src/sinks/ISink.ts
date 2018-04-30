import {IEvent} from '../core/IEvent';

export interface ISink {
    createEvent(event: IEvent): Promise<void>;

    commit(): Promise<void>
}
