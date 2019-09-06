import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { IrisProvider, OncallTeam} from '../../providers/iris/iris';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';
import { OncallUserPage } from '../oncall-user/oncall-user';


@Component({
  selector: 'page-oncall-team',
  templateUrl: 'oncall-team.html',
})
export class OncallTeamPage {
  team: OncallTeam;
  loading: boolean;
  loadingError: boolean;

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, public iris: IrisProvider, private irisInfo: IrisInfoProvider, private toastCtrl: ToastController) {
  }

  objectKeys = Object.keys;

  ionViewWillEnter() {

    if (!this.irisInfo.username) {
      // remove tab navigation on logout
      this.events.publish('user:logout');
      return;
    }

    this.getTeam();
  }

  getTeam(){
    this.loading = true;
    this.loadingError = false;
    this.iris.getOncallTeam(this.navParams.get('team_name')).subscribe(
      (data) => {
        this.team = data;
        this.loading = false;
      },
      (err) => {
        this.createToast('Error: failed to fetch oncall Team.');
        this.loadingError = true;
      }
    );
  }

  userTapped(tapped_user) {
    this.navCtrl.push(OncallUserPage, {
      username: tapped_user
    });
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
