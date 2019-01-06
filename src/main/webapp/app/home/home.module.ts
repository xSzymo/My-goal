import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MyGoalSharedModule } from 'app/shared';
import { HOME_ROUTE, HomeComponent } from './';
import { ModalsComponent } from 'app/modals/modals.component';

@NgModule({
    imports: [MyGoalSharedModule, RouterModule.forChild([HOME_ROUTE])],
    declarations: [HomeComponent, ModalsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyGoalHomeModule {}
