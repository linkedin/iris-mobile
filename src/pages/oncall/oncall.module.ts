import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OncallPage } from './oncall';

@NgModule({
  declarations: [
    OncallPage,
  ],
  imports: [
    IonicPageModule.forChild(OncallPage),
  ],
})
export class OncallPageModule {}
