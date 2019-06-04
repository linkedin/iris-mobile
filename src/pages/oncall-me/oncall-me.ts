import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { IrisProvider, OncallUser} from '../../providers/iris/iris';
import { OncallTeamPage } from '../oncall-team/oncall-team';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';
import { LogoutProvider } from '../../providers/logout/logout';
/**
 * Generated class for the OncallMePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
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

  getUser(){
    this.user = new OncallUser;
    this.loading = true;
    this.loadingError = false;
    this.iris.getOncallUser(this.irisInfo.username).subscribe(
      (data) => {
        
        
        // populate user with data from api call
        this.user.id = data[0].id;
        this.user.name = data[0].name;
        this.user.full_name = data[0].full_name;
        this.user.time_zone = data[0].time_zone;
        this.user.photo_url = data[0].photo_url;
        this.user.active = data[0].active;
        this.user.god = data[0].god;
        this.user.contacts = data[0].contacts;
        this.user.upcoming_shifts = data[1];
        this.user.teams = data[2];

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

  openActionSheet(){
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
