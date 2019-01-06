export class Session {
    createdDate: Date;
    end: Date;
    status: String;
    duration: number;
}

export class Goal {
    id: String;
    name: String;
    daily: number;
    total: number;
    endDate: Date;
    startDate: Date;
    sessions: [];
}
