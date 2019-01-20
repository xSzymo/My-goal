import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { GoalsService } from 'app/goals.service';
import { ModalEvent, ModalEventType } from 'app/modals/ModalsEvent';

@Injectable({ providedIn: 'root' })
@Component({
    selector: 'jhi-modals',
    templateUrl: './modals.component.html',
    styles: []
})
export class ModalsComponent implements OnInit {
    @Output() event = new EventEmitter<ModalEvent>();

    // tslint:disable-next-line:no-input-rename
    @Input('elementName') nameOfElementToDelete: String;

    name: String;
    dailyMin: number;
    endDate: Date;

    constructor(private goalService: GoalsService) {}

    ngOnInit() {}

    public deleteGoal(name: String) {
        this.goalService.delete(name).subscribe(() => this.event.emit(new ModalEvent(ModalEventType.Delete)));

        ($('#exampleModal1') as any).modal('hide');
    }

    public saveGoal(name: String, dailyMin: number, givenEndDate: Date) {
        const currentDate = new Date();
        const endDate = new Date(givenEndDate);
        endDate.setHours(currentDate.getHours());
        endDate.setMinutes(currentDate.getMinutes());
        endDate.setSeconds(currentDate.getSeconds());
        endDate.setMilliseconds(currentDate.getMilliseconds());

        this.goalService.create(name, dailyMin, endDate).subscribe(x => {
            const event = new ModalEvent(ModalEventType.Delete);
            event.goal = x;
            this.event.emit(event);
        });

        ($('#exampleModal') as any).modal('hide');
    }
}
