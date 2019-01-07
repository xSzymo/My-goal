import { Component, Injectable, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { Account, AccountService, LoginModalService } from 'app/core';
import { SERVER_API_URL } from 'app/app.constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Goal, Session } from 'app/home/Goal';
import { ModalsComponent } from 'app/modals/modals.component';
import { GoalsService } from 'app/goals.service';
import { ModalEvent, ModalEventType } from 'app/modals/ModalsEvent';

@Injectable({ providedIn: 'root' })
@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: ['home.css']
})
export class HomeComponent implements OnInit {
    elements = new BehaviorSubject<Goal[]>([]);
    account: Account;
    modalRef: NgbModalRef;
    disable: boolean;
    showDelete: boolean;

    elementToDelete: String;

    isAnyEventStarted = new BehaviorSubject<boolean>(false);
    showGoalDetails = new BehaviorSubject<boolean>(false);
    goal: Goal;

    GOALS_ACTION_URL: String = SERVER_API_URL + 'api/goal';

    constructor(
        private goalsService: GoalsService,
        private modalsComponent: ModalsComponent,
        private accountService: AccountService,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        private http: HttpClient,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.accountService.identity().then(account => {
            this.account = account;
            this.refreshElements();
            this.updateShowGoalDetails();
        });
        this.registerAuthenticationSuccess();

        this.updateShowGoalDetails();
    }

    public setElementToDelete(name: String) {
        this.elementToDelete = name;
    }

    public reactOnModalsAction(event: ModalEvent) {
        if (event.type == ModalEventType.Delete) this.refreshElements();
        if (event.type == ModalEventType.Create) this.elements.next(this.elements.getValue().concat(event.goal as Goal));
    }

    public refreshElements() {
        this.goalsService.get().subscribe(x => {
            this.elements.next(x);
            this.isAnyEventStarted.next(this.checkIfAnyElementIsStarted(x));
            this.updateShowGoalDetails();
        });
    }

    private updateShowGoalDetails() {
        this.route.queryParams.subscribe(params => {
            this.updateShowGoalDetailsFor(params.name);
        });
    }

    private updateShowGoalDetailsFor(name: String): void {
        const foundGoal = this.elements.getValue().find(x => x.name === name);
        if (foundGoal != null) {
            this.showGoalDetails.next(true);
            this.goal = foundGoal;
        } else {
            this.showGoalDetails.next(false);
        }
    }

    public getTotal(id: String): number {
        const foundGoal = this.elements.getValue().find(x => x.id === id);
        const goal = this.goalsService.createGoalInstance(foundGoal);

        const start = Math.ceil(goal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        const end = Math.ceil(new Date().getTime()) / (24 * 60 * 60 * 1000);
        return goal.daily * (Math.ceil(end) - Math.ceil(start) + 1) - goal.total;
    }

    public calculateLeftTimeForToday(id: String): number {
        const foundGoal = this.elements.getValue().find(x => x.id === id);
        const convertedGoal = this.goalsService.createGoalInstance(foundGoal);
        const endDateInEpoch =
            new Date().getTime() <= convertedGoal.endDate.getTime() ? new Date().getTime() : convertedGoal.endDate.getTime();

        const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        return convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1) - convertedGoal.total;
    }

    public packTime(id: String): String {
        const time = this.calculateLeftTimeForToday(id);
        return (time > 0 ? 'Left : ' : 'Nadgodzinki : ') + Math.abs(time);
    }

    public changeStateOfShowDelete() {
        this.showDelete = !this.showDelete;
    }

    private checkIfAnyElementIsStarted(x: Goal[]) {
        return (
            x
                .map((goal: Goal) => goal.sessions)
                .find((sessions: Session[]) => sessions.filter((session: Session) => session.status === 'INP').length > 0) != null
        );
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', message => {
            this.accountService.identity().then(account => {
                this.account = account;
                this.refreshElements();
            });
        });
    }

    isAuthenticated() {
        return this.accountService.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    hideAll(show: number) {
        setTimeout(() => (this.disable = false), 300);
        this.disable = true;
        ($('#collapseOne' + show) as any).collapse('toggle');
        for (let i = 0; i < this.elements.getValue().length; i++) {
            if (i !== show) {
                ($('#collapseOne' + i) as any).collapse('hide');
            }
        }
    }

    public start1(): Observable<Goal[]> {
        return this.http.get(this.GOALS_ACTION_URL + '/start/' + this.goal.name).pipe(map(x => x as Goal[]));
    }

    public stop1(): Observable<Goal[]> {
        return this.http.get(this.GOALS_ACTION_URL + '/stop').pipe(map(x => x as Goal[]));
    }

    public stop(): void {
        this.stop1().subscribe(x => {
            if (x.length > 1) {
                console.log('EXCETPION');
            }
            const elements = this.elements.getValue();
            const modifiedElements = elements.filter(element => element.name !== x[0].name);
            modifiedElements.push(x[0]);
            this.isAnyEventStarted.next(false);
            this.elements.next(modifiedElements);
        });
    }

    public start(): void {
        this.start1().subscribe(x => {
            if (x.length > 1) {
                console.log('EXCETPION');
            }
            const elements = this.elements.getValue();
            const modifiedElements = elements.filter(element => element.name !== x[0].name);
            modifiedElements.push(x[0]);
            if (x.length === 1) {
                this.isAnyEventStarted.next(true);
            }
            this.elements.next(modifiedElements);
        });
    }

    public isCurrentEventStarted(): boolean {
        console.log(this.goal.sessions.filter((session: Session) => session.status === 'INP').length > 0);
        return this.goal.sessions.filter((session: Session) => session.status === 'INP').length > 0;
    }

    public getExpiredTimeForCurrentGoal() {
        const x = this.elements
            .getValue()
            .filter((x2: Goal) => x2.sessions.filter((x5: Session) => x5.status !== 'CLOSE').length > 0)
            .map((x2: Goal) => x2.sessions.filter((x3: Session) => x3.status !== 'CLOSE').map((x4: Session) => x4.duration));

        return Math.floor(((x[0][0] as number) > 0 ? (x[0][0] as number) : 1) / 60);
    }

    public showDetails(goal: Goal) {
        console.log(goal);
        console.log(this.isAnyEventStarted.getValue());
    }

    public convertDateToLocaleDateString(e: Date): String {
        return new Date(e).toLocaleDateString();
    }
}
