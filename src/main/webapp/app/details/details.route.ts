import { Route } from '@angular/router';
import { DetailsComponent } from './details.component';

export const DETAILS_ROUTE: Route = {
    path: 'details/:name',
    component: DetailsComponent,
    data: {
        authorities: [],
        pageTitle: 'My-Goal'
    }
};
