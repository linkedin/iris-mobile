import { Injectable } from '@angular/core';
import { AlertController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@Injectable()
export class LogoutProvider {

  constructor(public events: Events, private storage: Storage, private alertCtrl: AlertController) {
  }

  showLogout() {
    // Handle logout action sheet button
    const logout = () => {
      return this.storage.ready()
      .then(() => {
        Promise.all([
        this.storage.remove("accessKey"),
        this.storage.remove("accessExpiry"),
        this.storage.remove("refreshKey"),
        this.storage.remove("refreshExpiry"),
        this.storage.remove("username")])})
    }

    let alert = this.alertCtrl.create({
      title: 'Log out',
      message: 'Log out of Iris?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Log out',
          handler: () => {
            // Logic again needed for transitions to work properly.
            // Dismiss alert, then navigate to login page.
            let navTransition = alert.dismiss()
            logout().then(() => {
              navTransition.then(() => {
                // publish logout event so app can change root to loginpage
                this.events.publish('user:logout');

              })
            })
            return false;
          }
        }
      ]
    });
    alert.present();
  }

}
