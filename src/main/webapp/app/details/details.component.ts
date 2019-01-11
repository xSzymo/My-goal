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

        interval(60 * 1000)
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

    /*
    public getTotal(id: String): number {
        const foundGoal = this.elements.getValue().find(x => x.id === id);
        const goal = this.goalsService.createGoalInstance(foundGoal);

        const start = Math.ceil(goal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        const end = Math.ceil(new Date().getTime()) / (24 * 60 * 60 * 1000);
        return goal.daily * (Math.ceil(end) - Math.ceil(start) + 1) - goal.total;
    }*/
}
