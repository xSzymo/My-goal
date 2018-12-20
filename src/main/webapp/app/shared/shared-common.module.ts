import { NgModule } from '@angular/core';

import { JhiAlertComponent, JhiAlertErrorComponent, MyGoalSharedLibsModule } from './';

@NgModule({
    imports: [MyGoalSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [MyGoalSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class MyGoalSharedCommonModule {}
