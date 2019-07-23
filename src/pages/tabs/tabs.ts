import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Tabs } from 'ionic-angular';
import { IncidentsPage } from '../incidents/incidents';
import { OncallPage } from '../oncall/oncall';
import { OncallMePage } from '../oncall-me/oncall-me';


@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  @ViewChild('navTabs') tabRef: Tabs;

  rootPage:any = IncidentsPage;
  oncallPage:any = OncallPage;
  mePage:any = OncallMePage;
  highlight: {left: string, top: string, width: string}
  isTab: boolean = false

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  selectedTab() {
    let thisTab = this.tabRef.getSelected()
    let fbox = thisTab.btn.getNativeElement().getBoundingClientRect()
    this.highlight = {
      left: fbox.left+'px',
      top: fbox.bottom-2+'px',
      width: fbox.width+'px'
    }
    this.isTab = true
  }

}
