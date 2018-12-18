import { NgModule } from '@angular/core';

import { MyGoalSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent } from './';

@NgModule({
    imports: [MyGoalSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [MyGoalSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class MyGoalSharedCommonModule {}
