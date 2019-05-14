import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OncallTeamPage } from './oncall-team';

@NgModule({
  declarations: [
    OncallTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(OncallTeamPage),
  ],
})
export class OncallTeamPageModule {}
