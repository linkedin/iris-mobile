import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { IrisProvider, OncallUser} from '../../providers/iris/iris';
import { OncallTeamPage } from '../oncall-team/oncall-team';


@Component({
  selector: 'page-oncall-user',
  templateUrl: 'oncall-user.html',
})

export class OncallUserPage {

  user: OncallUser;
  loading: boolean;
  loadingError: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public iris: IrisProvider, private toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    this.getUser();  
  }

  getUser(){
    this.user = new OncallUser;
    this.loading = true;
    this.loadingError = false;
    this.iris.getOncallUser(this.navParams.get('name')).subscribe(
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
