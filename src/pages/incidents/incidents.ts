import { Component } from '@angular/core';
import { NavController, ToastController, MenuController, ActionSheetController, ModalController, AlertController, ItemSliding, Platform, Events } from 'ionic-angular';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { timer } from 'rxjs/observable/timer';

import { LogoutProvider } from '../../providers/logout/logout';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';
import { IrisProvider, Incident, IncidentFilters } from '../../providers/iris/iris';
import { ApiUrlPage } from '../api-url/api-url';
import { IncidentContextPage } from '../incident-context/incident-context';
import { FilterModalPage } from '../filter-modal/filter-modal';

class IncidentListItem {
  selected: boolean;
  incident: Incident;
  claimDisabled: boolean;
  debounce: boolean;
  constructor(selected: boolean, incident: Incident, claimDisabled: boolean) {
    this.selected = selected;
    this.incident = incident;
    this.claimDisabled = claimDisabled;
    this.debounce = false;
  }
}

@Component({
  selector: 'page-incidents',
  templateUrl: 'incidents.html'
})
export class IncidentsPage {

  incidents: Array<IncidentListItem> = [];
  // Stored as seconds from epoch
  incident_start: number = 0;
  selectMode: boolean;
  loading: boolean;
  filters: IncidentFilters;
  autoscroll: boolean = true;
  initialLimit: number = 30;
  initialized: boolean = false;

  constructor(public events: Events, public navCtrl: NavController, public iris: IrisProvider, private logOut: LogoutProvider,
    public menu: MenuController, private toastCtrl: ToastController, private storage: Storage,
    private actionCtrl: ActionSheetController, private modalCtrl: ModalController,
    private irisInfo: IrisInfoProvider, private alertCtrl: AlertController,
    private push: Push, private platform: Platform) {
  }

  public ionViewWillEnter() {
    if (!this.platform.is("cordova")) {
      this.iris.debug();
    }
    this.irisInfo.init().then(() => {
      if (!this.irisInfo.baseUrl) {
        this.navCtrl.setRoot(ApiUrlPage);
        return;
      }
      if (!this.irisInfo.username) {
        // remove tab navigation on logout
        this.events.publish('user:logout');
        return;
      }
      if (!this.initialized) {
        this.initIncidents();
        this.initPushNotification();
        this.iris.initOncallCache();

      } else {
        let incidents = Array.from(this.iris.incidents.values());
        incidents = incidents.sort((a, b) => {return b['created'] - a['created']});
        this.incidents = [];
        for (let i of incidents) {
          this.incidents.push(new IncidentListItem(false, this.iris.incidents.get(i.id), false))
        }
      }
    })
  }

  initIncidents() {
    this.initialized = true;
    this.selectMode = false;
    this.loading = true;
    this.incident_start = (Date.now() - 14 * 86400000) / 1000;
    // Initialize filters to "created >= 2 weeks from now, targeting logged in user"
    this.filters = new IncidentFilters();
    this.filters.active = true;
    this.filters.inactive = true;
    this.filters.queryParams = new Map([
      ['created__ge', (this.incident_start | 0).toString()],
      ['target', this.irisInfo.username],
      ['limit', this.initialLimit.toString()]
    ])
    // Populate incident list with these filters
    this.populateIncidents().subscribe(
      () => {
        this.loading = false;
      },
      (err) => {
        // On error, hide loading, remove created__ge optimization, and toast
        this.loading = false;
        this.filters.queryParams.delete('created__ge');
        this.createToast('Error: failed to fetch incidents. Refresh list to retry.')
      }
    );
  }

  initPushNotification() {
    let platform: string;
    // Check for supported platforms before initialization
    if (this.platform.is('android')) {
      platform = 'Android';
    } else if (this.platform.is('ios')) {
      platform = 'iOS';
    } else {
      console.warn('Push notifications unsupported for this platform')
      return
    }

    const options: PushOptions = {
      android: {
        forceShow: true,
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'true',
        categories: {
          incident: {
            yes: {
              callback: 'claimIncident',
              title: 'Claim',
              foreground: true,
              destructive: false
            }
          }
        }
      },
      windows: {}
    };
    const push: PushObject = this.push.init(options);
    // On registration event, check if this is a new ID, and register with the
    // backend if needed.
    push.on('registration').subscribe((data) => {
      this.storage.ready().then(
        () => this.storage.get('registrationId')
      ).then(
        (regId) => {
          if (regId != data.registrationId) {
            this.iris.register(data.registrationId, platform).subscribe(
              () => {
                this.storage.set('registrationId', data.registrationId);
              },
              () => this.createToast('Error: Failed to set up push notifications')
            )
          }
        }
      )
    });

    // Handle claim action on push notification
    push.on('claimIncident').subscribe((data) => {
      let incidentId = data.additionalData['incident_id'];
      this.navCtrl.push(IncidentContextPage,
        {
          incidentId: incidentId,
          claim: true
        });
      }
    );

    // After navigation from push notification, refresh incidents list
    push.on('notification').subscribe((data) => {
      let incidentId = data.additionalData['incident_id'];
      this.navCtrl.push(IncidentContextPage,
        {
          incidentId: incidentId,
          claim: false
        });
      }
    );

    push.on('error').subscribe((e) => {
      this.createToast('Error handling push notification')
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

  openActionSheet(){
    // Open action bar from the upper right ... button
    let actionSheet = this.actionCtrl.create({
      buttons: [
        {
          text: 'Filter',
          handler: () => {
            this.filterIncidents().then(() => {
              actionSheet.dismiss();
            })
            return false;
          },
          icon: 'ios-funnel'
        },
        {
          text: 'Claim all active',
          handler: () => {
            this.showClaimAll()
          },
          icon: 'custom-claim'
        },
        {
          text: 'Log out',
          cssClass: 'logout-button',
          handler: () => {
            this.logOut.showLogout();
          },
          icon: 'exit'
        }
      ]
    })
    actionSheet.present()
  }

  showClaimAll() {
    // Handler for "Claim all active" action sheet button
    let alert = this.alertCtrl.create({
      title: 'Claim All',
      message: 'Claim all active incidents?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Claim',
          handler: () => {
            // Logic needed for transitions to animate properly. Hide alert, then create toast.
            let navTransition = alert.dismiss();
            let actives = [];
            for (let i of this.incidents) {
              if (i.incident.active) {
                actives.push(i.incident)
              }
            }
            this.iris.claim(actives).subscribe(
            () => {
              navTransition.then(() => {this.createToast(`Claimed ${actives.length} incident(s).`);
              })
            },
            () => {
              navTransition.then(() => this.createToast('Error: failed to claim incidents.'))
            });
            return false
          }
        }
      ]
    });
    alert.present();
  }

  filterIncidents() {
    // Handle filter action sheet button. Open the Filter Modal page.
    let filterModal = this.modalCtrl.create(FilterModalPage, { filters: this.filters });
    filterModal.onDidDismiss((data) => {
      if (data.update) {
        this.filters = data.filters;
        this.loading = true;
        this.populateIncidents().subscribe(() => {
          this.loading = false;
        })
      }
    })
    return filterModal.present();
  }

  populateIncidents() {
    this.autoscroll = true;
    this.iris.clearIncidents();
    return this.iris.getIncidents(this.filters).do(
      (incidents: Array<Incident>) => {
        this.incidents = [];
        incidents = incidents.sort((a, b) => {return b['created'] - a['created'] || b['id'] - a['id']})
        for (let i = 0; i < incidents.length; i++) {
          this.incidents.push(new IncidentListItem(false, incidents[i], false))
        }
      }
    ).flatMap(
      (incidents: Array<Incident>) => {
        if (incidents.length < this.initialLimit) {
          return this.getMoreIncidents();
        } else {
          return Observable.of(incidents);
        }
      }
    );
  }

  refreshIncidents(refresher){
    // Refresh incidents list according to current filters
    this.populateIncidents().subscribe(
      () => {
        refresher.complete();
      },
      () => {
        this.createToast('Error: incident refresh failed')
        refresher.complete();
      }
    )
  }

  incidentTapped(item) {
    if (!this.selectMode) {
      this.navCtrl.push(IncidentContextPage, {
        incidentId: item.incident.id,
        claim: false
      });
    }
  }

  incidentHeld(item) {
    if (this.selectMode) {
      return;
    }
    // Debounce item for 500 ms to prevent accidental double-click after hold gesture
    item.debounce = true;
    timer(500).subscribe(
      () => item.debounce = false
    )
    item.selected = true;
    this.selectMode = true;
  }

  getMoreIncidents(): Observable<Array<Incident>> {
    this.autoscroll = true;
    // Get more incidents matching current filters
    let filters = this.filters.clone();
    let lastIncident = this.incidents[this.incidents.length - 1];

    // To get additional incidents, get rid of created__ge, and paginate using id__lt and created__le
    filters.queryParams.delete('created__ge');
    if (lastIncident) {
      filters.queryParams.set('id__lt', lastIncident.incident.id.toString());
      filters.queryParams.set('created__le', lastIncident.incident.created.toString());
    }
    return this.iris.getIncidents(filters).do(
      (incidents: Array<Incident>) => {
        incidents = incidents.sort((a, b) => {return b['created'] - a['created']});
        for (let i = 0; i < incidents.length; i++) {
          this.incidents.push(new IncidentListItem(false, incidents[i], false))
        }
        if (incidents.length < this.initialLimit) {
          this.autoscroll = false;
        }
      }
    )
  }

  doInfinite(infiniteScroll) {
    let prevLength = this.incidents.length;
    this.getMoreIncidents().subscribe((incidents: Array<Incident>) => {
      if (this.incidents.length == prevLength) {
        infiniteScroll.enable(false);
      }
      infiniteScroll.complete();
    })
  }

  showCheckboxes() {
    this.selectMode = true;
  }

  hideCheckboxes() {
    this.incidents.forEach((i) => {i.selected = false})
    this.selectMode = false;
  }

  claimChecked() {
    // Claim active, checked incidents
    let activeChecked = [];
    for (let i of this.incidents) {
      if (i.selected && i.incident.active) {
        activeChecked.push(i.incident)
      }
    }
    // On successful claim, exit select mode and toast to notify users
    this.iris.claim(activeChecked).subscribe(
      () => {
        this.createToast(`Claimed ${activeChecked.length} incident(s).`);
        this.hideCheckboxes();
      },
      () => {
        this.createToast('Failed to claim incidents!');
        this.hideCheckboxes();
      }
    );
  }

  claimItem(item: IncidentListItem, slidingItem: ItemSliding) {
    // Sliding item action
    item.claimDisabled = true;
    this.iris.claim([item.incident]).subscribe(
      () => {
        item.incident.active = false;
        item.claimDisabled = false;
        this.createToast('Incident claimed.')
        slidingItem.close()
      },
      () => {
        this.createToast('Error: failed to claim incident.')
        item.claimDisabled = false;
      }
    )
  }
}