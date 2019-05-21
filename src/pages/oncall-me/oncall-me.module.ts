import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OncallMePage } from './oncall-me';

@NgModule({
  declarations: [
    OncallMePage,
  ],
  imports: [
    IonicPageModule.forChild(OncallMePage),
  ],
})
export class OncallMePageModule {}
