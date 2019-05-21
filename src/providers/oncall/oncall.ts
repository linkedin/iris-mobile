import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NavController, ToastController, MenuController, ActionSheetController, ModalController, AlertController, ItemSliding, Platform } from 'ionic-angular';

import { IrisProvider, OncallUser, OncallTeam, OncallService } from '../../providers/iris/iris';
/*
  Generated class for the OncallProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class OncallProvider {
  public users: any = [];
  public teams: any = [];
  public services: any = [];
  oncallUsers: Array<OncallUser> = [];
  oncallTeams: Array<OncallTeam> = [];
  oncallServices: Array<OncallService> = [];


  constructor(public http: HttpClient, public iris: IrisProvider, private toastCtrl: ToastController) {

    this.oncallUsers = this.iris.oncallUsers;
    this.oncallUsers = this.oncallUsers.sort((a, b) => {if(b.name > a.name){return -1;}else{return 1;}})
    this.users = [];
    for (let i = 0; i < this.oncallUsers.length; i++) {
      this.users.push({username: this.oncallUsers[i].name, full_name: this.oncallUsers[i].full_name})
    }

    this.oncallTeams = this.iris.oncallTeams;
    this.oncallTeams = this.oncallTeams.sort((a, b) => {if(b.name > a.name){return -1;}else{return 1;}})
    this.teams = [];
    for (let i = 0; i < this.oncallTeams.length; i++) {
      this.teams.push({name: this.oncallTeams[i]})
    }

    this.oncallServices = this.iris.oncallServices;
    this.oncallServices = this.oncallServices.sort((a, b) => {if(b.name > a.name){return -1;}else{return 1;}})
    this.services = [];
    for (let i = 0; i < this.oncallServices.length; i++) {
      this.services.push({name: this.oncallServices[i]})
    }


  }

  filterUsers(searchTerm) {
    if(this.users.length < 1){return false;}
    return this.users.filter(item => {

      if(item.username.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){return true;}
      if(item.full_name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){return true;}
      return false;
    });
  }
  filterTeams(searchTerm) {
    if(this.teams.length < 1){return false;}
    return this.teams.filter(item => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }
  filterServices(searchTerm) {
    if(this.services.length < 1){return false;}
    return this.services.filter(item => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
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
