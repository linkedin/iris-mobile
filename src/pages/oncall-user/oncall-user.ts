import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { IrisProvider, OncallUser } from '../../providers/iris/iris';
import { OncallTeamPage } from '../oncall-team/oncall-team';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import { LogoutProvider } from '../../providers/logout/logout';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'page-oncall-user',
  templateUrl: 'oncall-user.html',
})

export class OncallUserPage {

  user: OncallUser;
  loading: boolean;
  loadingError: boolean;
  mePageBool: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private actionCtrl: ActionSheetController, private logOut: LogoutProvider, public iris: IrisProvider, private irisInfo: IrisInfoProvider, private toastCtrl: ToastController, private sanitizer: DomSanitizer) {
  }

  ionViewWillEnter() {
    if (this.navParams.get('username')) {
      this.mePageBool = false;
      this.getUser();
    }
    else {
      this.mePageBool = true;
      this.getMe();
    }
  }

  getUser() {
    this.loading = true;
    this.loadingError = false;
    this.iris.getOncallUser(this.navParams.get('username')).subscribe(
      (data) => {
        // populate user with data from api call
        this.user = data;
        this.loading = false;
      },
      (err) => {
        this.loadingError = true;
        this.loading = false;
        this.createToast('loadingError: failed to fetch oncall user.')
      }
    );
  }

  getMe() {
    this.loading = true;
    this.loadingError = false;
    this.iris.getOncallUser(this.irisInfo.username).subscribe(
      (data) => {
        // populate user with data from api call
        this.user = data;
        this.loading = false;
      },
      (err) => {
        this.loadingError = true;
        this.loading = false;
        this.createToast('loadingError: failed to fetch oncall user.')
      }
    );
  }

  teamTapped(tapped_team) {
    this.navCtrl.push(OncallTeamPage, {
      team_name: tapped_team
    });
  }

  getSmsUrl(smsNumber) {
    var smslink = smsNumber.replace(/\D/g, '');
    smslink = 'sms:' + smslink;
    return this.sanitizer.bypassSecurityTrustUrl(smslink);
  }

  openActionSheet() {
    // Open action bar from the upper right ... button
    let actionSheet = this.actionCtrl.create({
      buttons: [
        {
          text: 'Log out',
          handler: () => {
            this.logOut.showLogout();
          },
          icon: 'exit'
        },
        {
          text: 'Privacy Policy',
          cssClass: 'logout-button',
          handler: () => {
            this.navCtrl.push(PrivacyPolicyPage);
          },
          icon: 'document'
        }
      ]
    })
    actionSheet.present()
  }

  createToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      showCloseButton: true,
      closeButtonText: 'OK'
    });
    toast.present();
  }

}
