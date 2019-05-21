import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { IrisProvider, OncallTeam} from '../../providers/iris/iris';
import { OncallUserPage } from '../oncall-user/oncall-user';

/**
 * Generated class for the OncallTeamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-oncall-team',
  templateUrl: 'oncall-team.html',
})
export class OncallTeamPage {
  team: OncallTeam;
  loading: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public iris: IrisProvider, private toastCtrl: ToastController) {
  }


  /* export class OncallTeam {
    name: string;
    email: string;
    slack_channel: string;
    summary: any;
    services: string[];
    rosters: any;
  } */
  objectKeys = Object.keys;

  ionViewDidLoad() {
    this.loading = true;
    this.team = new OncallTeam;

    this.iris.getOncallTeam(this.navParams.get('team_name')).subscribe(
      (data) => {
        
        this.team.name = data[0].name;
        this.team.email = data[0].email;
        this.team.slack_channel = data[0].slack_channel;
        this.team.summary = data[1];
        this.team.services = data[0].services;
        this.team.rosters = data[0].rosters;

        console.log(JSON.stringify(this.team));
        this.loading = false;
      },
      (err) => {
        this.createToast('Error: failed to fetch oncall Team.')
      }
    );

    console.log('ionViewDidLoad OncallTeamPage');
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
