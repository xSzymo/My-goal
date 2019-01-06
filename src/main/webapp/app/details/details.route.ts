import { Route } from '@angular/router';
import { DetailsComponent } from './details.component';

export const DETAILS_ROUTE: Route = {
    path: 'details',
    component: DetailsComponent,
    data: {
        authorities: [],
        pageTitle: 'My-Goal'
    }
};
