import { Component, Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SERVER_API_URL } from 'app/app.constants';

@Injectable({ providedIn: 'root' })
@Component({
    selector: 'jhi-modals',
    templateUrl: './modals.component.html',
    styles: []
})
export class ModalsComponent implements OnInit {
    elementToDelete: String;

    GOALS_URL: String = SERVER_API_URL + 'api/goal/events';
    GOALS_ACTION_URL: String = SERVER_API_URL + 'api/goal';

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    public showDeleteModal(name: String) {
        console.log('deleteing');
        this.elementToDelete = name;
        ($('#exampleModal1') as any).modal('show');
    }

    public deleteGoal(name: String) {
        this.http.delete(this.GOALS_URL + '/' + name).subscribe(() => this.refreshElements());

        ($('#exampleModal1') as any).modal('hide');
    }
}
