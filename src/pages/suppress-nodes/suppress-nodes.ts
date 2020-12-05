/**
 * Generated class for the SuppressNodesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

import { Component, ViewChild, Renderer2  } from '@angular/core';
import { IonicPage, NavParams, Slides, ViewController } from 'ionic-angular';
import { IrisProvider, Incident } from '../../providers/iris/iris';

import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-suppress-nodes',
  templateUrl: 'suppress-nodes.html',
})

export class SuppressNodesPage {

  public allSelected: boolean = true;

  incident: Incident
  comment: string;
  suppressionCreated: boolean;
  selectedNodes: any = [];
  suppressionType = "0";

  startTime: any = moment().format();
  startTimeAlertClears: any = moment().format();
  startTimeJira: any = moment().format();

  // Default it to 24 hours
  endTime: any = moment().add(1, 'days').format();
  jiraTicket: string;

  outPut: string;

  @ViewChild("suppressionSlider") slider: Slides;

  constructor(private navParams: NavParams, private view: ViewController, private renderer: Renderer2) {
  }

  // Close after successfully suppressing nodes
  suppressSelected(){
    this.suppressionCreated = true;
    if (this.allSelected) {
      this.toggleSelectAll();
    }

    // Replace below section with AJAX calls to IRIS Relays.
    if (this.suppressionType == "0") {
        this.outPut = "User selected 'Alert Clears' suppression type for "+ this.selectedNodes.length +" node(s). Start time is '" + this.startTimeAlertClears + "'. User comments: "+ this.comment;
    }
    else if (this.suppressionType == "1") {
      this.outPut = "User selected 'Date & Time' suppression type for "+ this.selectedNodes.length +" node(s). Start time is '" + this.startTime + "'. End Time '"+ this.endTime +"'. User comments: "+ this.comment;
    }
    else if (this.suppressionType == "2") {
      this.outPut = "User selected 'JIRA Closed' suppression type for "+ this.selectedNodes.length +" node(s). Start time is '" + this.startTimeJira + "'. JIRA Ticket # "+ this.jiraTicket +".User comments: "+ this.comment;
    }

    this.closeSuppression();
  }

  // Close without SuppressNode Modal
  closeSuppression(){
    if (this.suppressionCreated) {
      return this.view.dismiss(this.outPut);
    }
    this.view.dismiss();
  }

  // This brings the value from IncidentContextPage
  ionViewWillLoad() {
    this.incident = this .navParams.get('incident');
  }

  // Setting the initial state
  ionViewDidLoad() {
    this.suppressionCreated = false;
  }

  toggleSelectAll(){
    var tempArray : Array<string> = [];
    for (let node of this.incident.context["nodes"]) {
      tempArray.push(node)
    }
    this.selectedNodes = tempArray
  }

  // Select Suppression Type
  selectedSuppressionType(index){
    this.slider.slideTo(index);
  }

  changeSuppressionType($event){
    this.suppressionType = $event._snapIndex.toString();
  }

  onChange() {
    setTimeout(() => {
      const element = this.renderer.selectRootElement('.select-text');
      this.renderer.setProperty(element, 'innerHTML', this.selectedNodes.length + " selected")
    }, 0);
  }


}
