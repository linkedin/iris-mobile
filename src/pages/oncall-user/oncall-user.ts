import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { IrisProvider, OncallUser} from '../../providers/iris/iris';

/**
 * Generated class for the OncallUserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-oncall-user',
  templateUrl: 'oncall-user.html',
})

/* export class OncallUser {
  id: number;
  name: string;
  full_name: string;
  time_zone: string;
  photo_url: string;
  active: number;
  god: number;
  contacts: any;
  upcoming_shifts: any;
  teams: any;
}
 */
export class OncallUserPage {

  user: OncallUser;

  constructor(public navCtrl: NavController, public navParams: NavParams, public iris: IrisProvider, private toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OncallUserPage');

    this.iris.getOncallUser(this.navParams.get('username')).subscribe(
      (obj) => {
        this.user = new OncallUser;
        console.log(JSON.stringify(obj));
      },
      (err) => {
        this.createToast('Error: failed to fetch oncall USER.')
      }
    );
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
