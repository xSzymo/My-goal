import { Component, Injectable, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Account, AccountService, LoginModalService } from 'app/core';
import { BehaviorSubject } from 'rxjs';
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

    constructor(
        private goalsService: GoalsService,
        private modalsComponent: ModalsComponent,
        private accountService: AccountService,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager
    ) {}

    ngOnInit() {
        this.accountService.identity().then(account => {
            this.account = account;
            this.refreshElements();
        });
        this.registerAuthenticationSuccess();
    }

    public setElementToDelete(name: String) {
        this.elementToDelete = name;
    }

    public reactOnModalsAction(event: ModalEvent) {
        if (event.type === ModalEventType.Delete) {
            this.refreshElements();
        }
        if (event.type === ModalEventType.Create) {
            this.elements.next(this.elements.getValue().concat(event.goal as Goal));
        }
    }

    public refreshElements() {
        this.goalsService.get().subscribe(x => {
            this.elements.next(x);
            this.isAnyEventStarted.next(this.checkIfAnyElementIsStarted(x));
        });
    }

    public changeStateOfShowDelete() {
        this.showDelete = !this.showDelete;
    }

    private checkIfAnyElementIsStarted(x: Goal[]): boolean {
        return (
            x
                .map((goal: Goal) => goal.sessions)
                .find((sessions: Session[]) => sessions.filter((session: Session) => session.status === 'INP').length > 0) != null
        );
    }

    private checkIfAnySessionIsStarted(x: Goal): boolean {
        return x.sessions.filter((session: Session) => session.status === 'INP').length > 0;
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

    public convertDateToLocaleDateString(e: Date): String {
        return new Date(e).toLocaleDateString();
    }

    //oraz trzeba dolozyc nowa zmianne na backu ktora bedzie definiowala ile minut jest wymaaggane na ile dni? tydzien meisiac total?
    public daysToEnd(e: Date): number {
        //zastanowiz csie co ma byc na glownej stronce / najwazniejsze info a na details wszystko wszystko
        //moze pierwsze zaczac od tamtej stronki a potem tylko zadecydowac o priortyteach
        return Math.floor((new Date().getUTCDate() - new Date(e).getUTCDate()) * 1000 * 60 * 60 * 24);
    }

    public packTime(id: String): String {
        const time = this.calculateLeftTimeForToday(id);
        const started = this.checkIfAnySessionIsStarted(this.elements.getValue().find(x => x.id === id));

        if (started) {
            return (time > 0 ? 'INP | Left : ' : 'Nadgodzinki : ') + Math.abs(time);
        } else {
            return (time > 0 ? 'Left : ' : 'Nadgodzinki : ') + Math.abs(time);
        }
    }

    public todayTime(goal: Goal): number {
        if (goal.sessions.length === 0) return 0;

        return Math.floor(
            goal.sessions
                .filter((x: Session) => new Date(x.createdDate).getUTCDate() <= new Date().getUTCDate())
                .map((x: Session) => x.duration)
                .reduce((a, b) => a + b) / 60
        );
    }

    public calculateLeftTimeForToday(id: String): number {
        const foundGoal = this.elements.getValue().find(x => x.id === id);
        const convertedGoal = GoalsService.createGoalInstance(foundGoal);
        const endDateInEpoch =
            new Date().getTime() <= convertedGoal.endDate.getTime() ? new Date().getTime() : convertedGoal.endDate.getTime();

        const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        return convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1) - convertedGoal.total;
    }
}
