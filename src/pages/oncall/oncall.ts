import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';

import { LogoutProvider } from '../../providers/logout/logout';
import { OncallUserPage } from '../oncall-user/oncall-user';
import { OncallTeamPage } from '../oncall-team/oncall-team';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import { IrisProvider, OncallUser, OncallTeam } from '../../providers/iris/iris';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';


@Component({
  selector: 'page-oncall',
  templateUrl: 'oncall.html',
})
export class OncallPage {
  searchTerm: string = "";
  users: any = [];
  teams: any = [];
  services: any = [];
  pinnedTeams: OncallTeam[];

  unfilteredUsers: Array<OncallUser> = [];
  unfilteredTeams: Array<string> = [];
  unfilteredServices: Array<string> = [];

  usersLoading: boolean = true;
  teamsLoading: boolean = true;
  servicesLoading: boolean = true;
  pinnedTeamsLoading: boolean = true;
  loadingError: boolean = false;


  constructor(private logOut: LogoutProvider, public navCtrl: NavController,
    public navParams: NavParams, private actionCtrl: ActionSheetController,
    private iris: IrisProvider, private toastCtrl: ToastController,
    private irisInfo: IrisInfoProvider) {
  }

  ionViewWillEnter() {
    // pinned teams display on call now data so make sure they are up to date every time
    this.pinnedTeamsLoading = true;
    this.initPinnedTeams();
    this.initOncallLists();
    
  }

  initOncallLists(){
    
    // if users were saved in storage initialize list with that data while we wait from response from server
    if(this.iris.oncallUsersLoaded){
      this.unfilteredUsers = this.iris.oncallUsers;
      this.usersLoading = false;
    }

    // if teams were saved in storage initialize list with that data while we wait from response from server
    if(this.iris.oncallTeamsLoaded){
      this.unfilteredTeams = this.iris.oncallTeams;
      this.teamsLoading = false;
    }

    // if services were saved in storage initialize list with that data while we wait from response from server
    if(this.iris.oncallServicesLoaded){
      this.unfilteredServices = this.iris.oncallServices;
      this.servicesLoading = false;
    }

    this.iris.getOncallUsers().subscribe(
      (users) => {
        this.unfilteredUsers = users;
        this.usersLoading = false;
      },
      () => {
        this.createToast('Error: failed to fetch oncall users.');
        this.loadingError = true;
      },

    );

    this.iris.getOncallTeams().subscribe(
      (teams) => {
        this.unfilteredTeams = teams;
        this.teamsLoading = false;
      },
      () => {
        this.createToast('Error: failed to fetch oncall teams.');
        this.loadingError = true;
      }
    );

    this.iris.getOncallServices().subscribe(
      (services) => {
        this.unfilteredServices = services;
        this.servicesLoading = false;
      },
      () => {
        this.createToast('Error: failed to fetch oncall services.');
        this.loadingError = true;
      }
    );

  }

  initPinnedTeams(){

    this.iris.getOncallPinnedTeams(this.irisInfo.username).subscribe(
      (teams_data) => {
        // fire off calls for pinned teams and render them 
        this.pinnedTeams = [];
        for(let pinned_team of teams_data){
          this.iris.getOncallTeam(pinned_team).subscribe(
            (team_data) => {      
              this.pinnedTeams.push(team_data);
              if (this.pinnedTeams.length == teams_data.length){
                // wait untill all pinned teams have loaded
                this.pinnedTeamsLoading = false;
              }
              
            },
            () => {
              this.createToast('Error: failed to fetch oncall Team.');
              this.pinnedTeamsLoading = false;
              this.loadingError = true;
            }
          );

        }
      },
      () => {
        this.createToast('Error: failed to fetch oncall pinned teams.');
        this.loadingError = true;
      }
    );
  }
  
  refreshPress(){
    this.loadingError = false;
    this.servicesLoading = true;
    this.usersLoading = true;
    this.teamsLoading = true;
    this.pinnedTeamsLoading = true;
    this.initOncallLists();
    this.initPinnedTeams();

  }

  setFilteredItems() {
    if(this.searchTerm.length >= 3){
      this.users = this.filterUsers(this.searchTerm);
      this.teams = this.filterTeams(this.searchTerm);
      this.services = this.filterServices(this.searchTerm);
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
          text: 'Log out',
          handler: () => {
            this.logOut.showLogout();
          },
          icon: 'exit'
        },
        {
          text: 'Privacy Policy',
          cssClass: 'logout-button',
          handler: () => {
            this.navCtrl.push(PrivacyPolicyPage);
          },
          icon: 'document'
        }

      ]
    })
    actionSheet.present()
  }

  userTapped(tapped_user) {
    this.navCtrl.push(OncallUserPage, {
      username: tapped_user
    });
  }
  
  teamTapped(tapped_team) {
    this.navCtrl.push(OncallTeamPage, {
      team_name: tapped_team
    });
  }

  serviceTapped(service) {
    this.iris.getOncallService(service).subscribe(
      team =>{
        this.navCtrl.push(OncallTeamPage, {
          team_name: team[0]
        });
      },
      () => {
        this.createToast('Error: failed to fetch service details.')
      }
    );
  }

  filterUsers(searchTerm) {
    if(this.unfilteredUsers.length < 1){return false;}
    return this.unfilteredUsers.filter(item => {
      if(item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){return true;}
      if(item.full_name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){return true;}
      return false;
    });
  }
  filterTeams(searchTerm) {
    if(this.unfilteredTeams.length < 1){return false;}
    return this.unfilteredTeams.filter(item => {
      return item.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }
  filterServices(searchTerm) {
    if(this.unfilteredServices.length < 1){return false;}
    return this.unfilteredServices.filter(item => {
      return item.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
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
