import { Injectable } from '@angular/core';
import { AlertController, App } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../../pages/login/login';

/*
  Generated class for the LogoutProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LogoutProvider {

  constructor( private storage: Storage, private app: App, private alertCtrl: AlertController) {
    console.log('Hello LogoutProvider Provider');
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
                this.app.getRootNav().setRoot(LoginPage, {loggedOut: true});
                this.app.getActiveNav().setRoot(LoginPage, {loggedOut: true});

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
