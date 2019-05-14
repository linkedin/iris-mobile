import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OncallUserPage } from './oncall-user';

@NgModule({
  declarations: [
    OncallUserPage,
  ],
  imports: [
    IonicPageModule.forChild(OncallUserPage),
  ],
})
export class OncallUserPageModule {}
