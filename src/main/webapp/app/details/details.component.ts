import { Component, Injectable, OnInit } from '@angular/core';
import { AccountService } from 'app/core';
import { ActivatedRoute } from '@angular/router';
import { Goal, Session } from 'app/home/Goal';
import { BehaviorSubject, interval } from 'rxjs';
import { GoalsService } from 'app/goals.service';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@Component({
    selector: 'jhi-details',
    templateUrl: './details.component.html',
    styleUrls: ['details.css']
})
export class DetailsComponent implements OnInit {
    goal = new BehaviorSubject<Goal>(null);
    started = new BehaviorSubject<boolean>(false);

    constructor(private goalsService: GoalsService, private accountService: AccountService, private activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activatedRoute.params.subscribe(routeParams => {
            this.goalsService.getOne(routeParams.name).subscribe(goals => {
                this.goal.next(goals[0]);
                this.started.next(this.isStarted(goals[0]));
            });
        });

        interval(61 * 1000)
            .pipe(filter(() => this.started.getValue()))
            .subscribe(() => {
                this.goalsService.getOne(this.goal.getValue().name).subscribe(x1 => this.goal.next(x1[0]));
            });
    }

    public stop(): void {
        this.goalsService.stop().subscribe(x => {
            if (x.length > 1) {
                console.log('EXCETPION');
            }
            this.started.next(false);
        });
    }

    public start(): void {
        this.goalsService.start(this.goal.getValue().name).subscribe(x => {
            if (x.length > 1) {
                console.log('EXCETPION');
            }
            if (x.length === 1) {
                this.goal.next(x[0]);
                this.started.next(true);
            }
        });
    }

    private isStarted(goal: Goal): boolean {
        return goal.sessions.find((session: Session) => session.status === 'INP') != null;
    }

    public completedTime(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);

        const differenceBetweenEndAndStartDateInMilis = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
        const requiredTimeInMin = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        const expiredTime = Math.floor(completedSec / 60);

        return Math.floor((expiredTime / requiredTimeInMin) * 100);
    }

    public completedTimeWithinString(goal: Goal): String {
        const percent = this.completedTime(goal);
        console.log(percent);
        return (percent > 100 ? 100 : percent) + '%';
    }

    public convertDateToLocaleDateString(e: Date): String {
        if (e == null) {
            return '';
        }

        return new Date(e).toLocaleDateString();
    }

    public getExpiredTimeForCurrentGoal() {
        if (this.goal.getValue() == null) {
            return null;
        }

        const x = this.goal
            .getValue()
            .sessions.filter((x3: Session) => x3.status !== 'CLOSE')
            .map((x4: Session) => x4.duration);

        return Math.floor(((x[0] as number) > 0 ? (x[0] as number) : 1) / 60);
    }

    public getRequired(goal: Goal): number {
        if (goal == null) {
            return 0;
        }

        const differenceBetweenEndAndStartDateInMilis = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
        return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
    }
}
