import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IncidentsPage } from '../incidents/incidents';
import { OncallPage } from '../oncall/oncall';
import { OncallMePage } from '../oncall-me/oncall-me';
/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  rootPage:any = IncidentsPage;
  oncallPage:any = OncallPage;
  mePage:any = OncallMePage;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

}
