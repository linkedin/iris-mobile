import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { IrisProvider, OncallUser} from '../../providers/iris/iris';
import { OncallTeamPage } from '../oncall-team/oncall-team';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';
import { LogoutProvider } from '../../providers/logout/logout';

@Component({
  selector: 'page-oncall-me',
  templateUrl: 'oncall-me.html',
})
export class OncallMePage {
  user: OncallUser;
  loading: boolean;
  loadingError: boolean;

  constructor(private logOut: LogoutProvider, public navCtrl: NavController, public navParams: NavParams, private actionCtrl: ActionSheetController, public iris: IrisProvider, private toastCtrl: ToastController, private irisInfo: IrisInfoProvider) {
  }

  ionViewWillEnter() {
    this.getUser();
  }

  getUser() {
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

  openActionSheet() {
    // Open action bar from the upper right ... button
    let actionSheet = this.actionCtrl.create({
      buttons: [
        {
          text: 'Log out',
          cssClass: 'logout-button',
          handler: () => {
            this.logOut.showLogout();
          },
          icon: 'exit'
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
