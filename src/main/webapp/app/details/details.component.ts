import { Component, Injectable, OnInit } from '@angular/core';
import { HomeComponent } from 'app/home';
import { AccountService, LoginModalService } from 'app/core';
import { JhiEventManager } from 'ng-jhipster';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ModalsComponent } from 'app/modals/modals.component';

@Injectable({ providedIn: 'root' })
@Component({
    selector: 'jhi-details',
    templateUrl: './details.component.html',
    styleUrls: ['details.css']
})
export class DetailsComponent implements OnInit {
    constructor(
        private accountService: AccountService,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        private http: HttpClient,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        for (let i = 0; i < 20; i++) console.log('HALO');
    }
}
