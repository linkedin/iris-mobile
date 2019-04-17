import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { IncidentFilters } from '../../providers/iris/iris';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';

/**
 * Modal handling incident filters
 */

@Component({
  selector: 'page-filter-modal',
  templateUrl: 'filter-modal.html',
})
export class FilterModalPage {

  filters: IncidentFilters;
  usernameVal: string;
  userFilter: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    private irisInfo: IrisInfoProvider) {
  }

  ionViewDidLoad() {
    // Create local version of incident filters
    this.filters = this.navParams.get('filters').clone();
    let username = this.filters.queryParams.get('target');
    this.userFilter = username != this.irisInfo.username;
    if (this.userFilter) {
      this.usernameVal = username;
    }
  }

  filterUser() {
    this.userFilter = true;
  }

  dismiss(update: boolean) {
    // update == false if user pressed cancel, true if user pressed confirm.
    // Pass this to incidents page along with updated filters
    if (this.userFilter) {
      this.filters.queryParams.set('target', this.usernameVal);
    } else {
      this.filters.queryParams.set('target', this.irisInfo.username);
    }
    this.viewCtrl.dismiss({
      update: update,
      filters: this.filters
    });
  }
}
