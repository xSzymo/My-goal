import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'app/core';
import { GoalsService } from 'app/goals.service';
import { Goal, Session, SessionModel } from 'app/home/Goal';
import { BehaviorSubject, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TimeGoalsService } from 'app/goals.time.service';

@Injectable({ providedIn: 'root' })
@Component({
    selector: 'jhi-details',
    templateUrl: './details.component.html',
    styleUrls: ['details.css']
})
export class DetailsComponent implements OnInit {
    goal = new BehaviorSubject<Goal>(null);
    started = new BehaviorSubject<boolean>(false);

    constructor(
        private goalsService: GoalsService,
        private accountService: AccountService,
        private activatedRoute: ActivatedRoute,
        public timeGoalsService: TimeGoalsService
    ) {}

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

    public getProperSessions(goal: Goal): any {
        if (goal == null) {
            return [];
        }

        const map = new Map();
        goal.sessions.forEach((session: Session) => {
            const createdDate = new Date(session.createdDate).getTime();
            if (!map.has(GoalsService.convertMilisToDays(createdDate))) {
                const sessionModel = new SessionModel();
                sessionModel.date = session.createdDate;
                sessionModel.duration = session.duration;
                // sessionModel.sessions.push(session);TODO
                map.set(GoalsService.convertMilisToDays(createdDate), sessionModel);
            } else {
                const sessionModel = map.get(GoalsService.convertMilisToDays(createdDate));
                sessionModel.duration += session.duration;
                // sessionModel.sessions.push(session);
                map.set(GoalsService.convertMilisToDays(createdDate), sessionModel);
            }
        });
        let array = Array.from(map.values());
        array.forEach((session: Session) => (session.duration = session.duration > 0 ? Math.floor(session.duration / 60) : 0));
        array = array
            .filter((x: SessionModel) => {
                const date = new Date();
                if (this.timeGoalsService.daysToShow !== '0') {
                    date.setDate(date.getDate() - parseInt(this.timeGoalsService.daysToShow));
                } else {
                    date.setDate(date.getDate() - 1000000);
                }
                return new Date(x.date).getTime() > date.getTime();
            })
            .sort((a: Session, b: Session) => new Date(a.end).getTime() - new Date(b.end).getTime());
        return array.reverse();
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
    public todayTime(goal: Goal): number {
        if (goal.sessions.length === 0) {
            return 0;
        }

        return Math.floor(
            goal.sessions
                .filter((x: Session) => new Date(x.createdDate).getUTCDate() <= new Date().getUTCDate())
                .map((x: Session) => x.duration)
                .reduce((a, b) => a + b) / 60
        );
    }

    public daysToEnd(e: Goal): number {
        return Math.floor((new Date(e.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    }

    public deleteSession(session: Session) {
        console.log(session);
    }

    public editSession(session: Session) {
        console.log(session);
    }
}
