import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { IrisProvider, OncallTeam} from '../../providers/iris/iris';
import { OncallUserPage } from '../oncall-user/oncall-user';


@Component({
  selector: 'page-oncall-team',
  templateUrl: 'oncall-team.html',
})
export class OncallTeamPage {
  team: OncallTeam;
  loading: boolean;
  loadingError: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public iris: IrisProvider, private toastCtrl: ToastController) {
  }

  objectKeys = Object.keys;

  ionViewWillEnter() {
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
