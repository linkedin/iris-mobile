import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';


@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
})
export class PrivacyPolicyPage {

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, private iab: InAppBrowser, private irisInfo: IrisInfoProvider) {
    
  }

  public configPrivacyPolicyUrl: string = process.env.PRIVACY_POLICY_URL;

  ionViewWillEnter() {

    if (!this.irisInfo.username) {
      // remove tab navigation on logout
      this.events.publish('user:logout');
      return;
    }

    const browser = this.iab.create(this.configPrivacyPolicyUrl);
    browser.show();
  }
  openUrl() {
    const browser = this.iab.create(this.configPrivacyPolicyUrl);
    browser.show();
  }

}
