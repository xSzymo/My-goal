import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from 'app/home/Goal';
import { SERVER_API_URL } from 'app/app.constants';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GoalsService {
    GOALS_URL: string = SERVER_API_URL + 'api/goal/events';
    GOALS_ACTION_URL: string = SERVER_API_URL + 'api/goal';

    constructor(private http: HttpClient) {}

    public get(): Observable<Goal[]> {
        return this.http.get(this.GOALS_URL).pipe(map(x => x as Goal[]));
    }

    public getOne(name: String): Observable<Goal[]> {
        return this.http.get(this.GOALS_URL + '/' + name).pipe(map(x => x as Goal[]));
    }

    public create(name: String, dailyMin: number, endDate: Date): Observable<Goal> {
        return this.http.post(this.GOALS_URL + '', this.pack(name, dailyMin, endDate)).pipe(map(x => x as Goal));
    }

    public delete(name: String): Observable<Object> {
        return this.http.delete(this.GOALS_URL + '/' + name);
    }

    public start(name: String): Observable<Goal[]> {
        return this.http.get(this.GOALS_ACTION_URL + '/start/' + name).pipe(map(x => x as Goal[]));
    }

    public stop(): Observable<Goal[]> {
        return this.http.get(this.GOALS_ACTION_URL + '/stop').pipe(map(x => x as Goal[]));
    }

    private pack(_name: String, dailyMin: number, endDate: Date): any {
        return {
            name: _name,
            daily: dailyMin,
            endDate: new Date(endDate)
        };
    }

    public createGoalInstance(passed: Goal): Goal {
        const goal = new Goal();
        goal.id = passed.id;
        goal.name = passed.name;
        goal.daily = passed.daily;
        goal.total = passed.total;
        goal.endDate = new Date(passed.endDate);
        goal.startDate = new Date(passed.startDate);
        goal.sessions = passed.sessions;

        return goal;
    }
}
