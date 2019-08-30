import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';


@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
})
export class PrivacyPolicyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private iab: InAppBrowser) {
    
  }

  public configPrivacyPolicyUrl: string = process.env.PRIVACY_POLICY_URL;

  ionViewWillEnter() {
    const browser = this.iab.create(this.configPrivacyPolicyUrl);
    browser.show();
  }
  openUrl() {
    const browser = this.iab.create(this.configPrivacyPolicyUrl);
    browser.show();
  }

}
