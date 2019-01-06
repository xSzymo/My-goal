import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MyGoalSharedModule } from 'app/shared';
import { DETAILS_ROUTE } from './details.route';
import { DetailsComponent } from './details.component';

@NgModule({
    imports: [MyGoalSharedModule, RouterModule.forChild([DETAILS_ROUTE])],
    declarations: [DetailsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyGoalDetailsModule {}
