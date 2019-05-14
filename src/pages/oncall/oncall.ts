import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { IncidentsPage } from '../incidents/incidents';
import { LoginPage } from '../login/login';
import { OncallUserPage } from '../oncall-user/oncall-user';
import { OncallProvider } from '../../providers/oncall/oncall';
/**
 * Generated class for the OncallPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-oncall',
  templateUrl: 'oncall.html',
})
export class OncallPage {
  public searchTerm: string = "";
  public users: any;
  public teams: any;
  public services: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private actionCtrl: ActionSheetController, private storage: Storage, private alertCtrl: AlertController, private oncallProvider: OncallProvider) {
  }

  ionViewDidLoad() {
    this.setFilteredItems();
  }

  setFilteredItems() {
    if(this.searchTerm.length >= 3){
      this.users = this.oncallProvider.filterUsers(this.searchTerm);
      this.teams = this.oncallProvider.filterTeams(this.searchTerm);
      this.services = this.oncallProvider.filterServices(this.searchTerm);
    }
    else{
      this.users = [];
      this.teams = [];
      this.services = [];
    }
  }

  openActionSheet(){
    // Open action bar from the upper right ... button
    let actionSheet = this.actionCtrl.create({
      buttons: [
        {
          text: 'Incidents',
          handler: () => {
            this.navCtrl.setRoot(IncidentsPage);
          },
          icon: 'aperture'
        },
        {
          text: 'Log out',
          cssClass: 'logout-button',
          handler: () => {
            this.showLogout();
          },
          icon: 'exit'
        }
      ]
    })
    actionSheet.present()
  }

  userTapped(tapped_user) {
    this.navCtrl.push(OncallUserPage, {
      username: tapped_user.username
    });
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
                this.navCtrl.setRoot(LoginPage, {loggedOut: true});
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
