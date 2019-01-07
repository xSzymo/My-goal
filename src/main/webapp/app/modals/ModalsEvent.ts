import { Goal } from 'app/home/Goal';

export class ModalEvent {
    goal: Goal;
    type: ModalEventType;

    public constructor(type: ModalEventType) {
        this.type = type;
    }
}

export enum ModalEventType {
    Delete = 'delete',
    Create = 'create'
}
