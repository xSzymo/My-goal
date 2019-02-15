import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'app/core';
import { GoalsService } from 'app/goals.service';
import { Goal, Session, SessionModel } from 'app/home/Goal';
import { BehaviorSubject, interval } from 'rxjs';
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
    daysToShow = '7';

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

    public completedTimeToday(foundGoal: Goal): number {
        if (foundGoal == null || foundGoal.sessions.length === 0) {
            return 0;
        }
        const convertedGoal = GoalsService.createGoalInstance(foundGoal);
        const endDateInEpoch =
            new Date().getTime() <= convertedGoal.endDate.getTime() ? new Date().getTime() : convertedGoal.endDate.getTime();

        const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        const requiredTime = convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1);

        const completedSec = foundGoal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }

        return Math.floor((expiredTime / requiredTime) * 100);
    }

    public completedTimeWeek(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }
        const date = new Date();
        date.setDate(date.getDate() + 7);

        const convertedGoal = GoalsService.createGoalInstance(goal);
        const endDateInEpoch = date.getTime() <= convertedGoal.endDate.getTime() ? date.getTime() : convertedGoal.endDate.getTime();

        // const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        // const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        // const requiredTime = convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1);
        const differenceBetweenEndAndStartDateInMilis = endDateInEpoch - new Date(convertedGoal.startDate).getTime();
        let days = 0;
        if (GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) === 0 && differenceBetweenEndAndStartDateInMilis > 0) {
            days = 1;
        } else {
            days = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        }
        const requiredTime = days * convertedGoal.daily;

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }

        return Math.floor((expiredTime / requiredTime) * 100);
    }

    public completedTimeMonth(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }
        const date = new Date();
        date.setDate(date.getDate() + 30);

        const convertedGoal = GoalsService.createGoalInstance(goal);
        const endDateInEpoch = date.getTime() <= convertedGoal.endDate.getTime() ? date.getTime() : convertedGoal.endDate.getTime();

        // const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        // const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        // const requiredTime = convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1);
        const differenceBetweenEndAndStartDateInMilis = endDateInEpoch - new Date(convertedGoal.startDate).getTime();
        let days = 0;
        if (GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) === 0 && differenceBetweenEndAndStartDateInMilis > 0) {
            days = 1;
        } else {
            days = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        }
        const requiredTime = days * convertedGoal.daily;

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }

        return Math.floor((expiredTime / requiredTime) * 100);
    }

    public completedTime(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        if (completedSec < 60) {
            return 0;
        }

        if (completedSec < 60) {
            return 0;
        }
        const differenceBetweenEndAndStartDateInMilis = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
        let days = 0;
        if (GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) === 0 && differenceBetweenEndAndStartDateInMilis > 0) {
            days = 1;
        } else {
            days = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        }
        const requiredTimeInMin = days * goal.daily;
        const expiredTime = Math.floor(completedSec / 60);

        return Math.floor((expiredTime / requiredTimeInMin) * 100);
    }

    public completedTimeWithinString(goal: Goal): String {
        const percent = this.completedTime(goal);
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

        if (this.daysToShow === '1') {
            const differenceBetweenEndAndStartDateInMilis = new Date().getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily + goal.daily;
        }
        if (this.daysToShow === '7') {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            const endDate = date.getTime() <= new Date(goal.endDate).getTime() ? date : goal.endDate;
            const differenceBetweenEndAndStartDateInMilis = new Date(endDate).getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        }
        if (this.daysToShow === '30') {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            const endDate = date.getTime() <= new Date(goal.endDate).getTime() ? date : goal.endDate;
            const differenceBetweenEndAndStartDateInMilis = new Date(endDate).getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        }
        if (this.daysToShow === '0') {
            const differenceBetweenEndAndStartDateInMilis = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        }
    }

    public getDaysToShow(): String {
        if (this.daysToShow === '1') {
            return 'Today\'s progress';
        }
        if (this.daysToShow === '7') {
            return 'Current week progress';
        }
        if (this.daysToShow === '30') {
            return 'Current month progress';
        }
        if (this.daysToShow === '0') {
            return 'All time progress';
        }
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
                if (this.daysToShow !== '0') {
                    date.setDate(date.getDate() - parseInt(this.daysToShow));
                } else {
                    date.setDate(date.getDate() - 1000000);
                }
                return new Date(x.date).getTime() > date.getTime();
            })
            .sort((a: Session, b: Session) => new Date(a.end).getTime() - new Date(b.end).getTime());
        return array.reverse();
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

    compareFn(): boolean {
        return true;
    }
}
