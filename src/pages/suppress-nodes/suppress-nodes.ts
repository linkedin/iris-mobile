/**
 * Generated class for the SuppressNodesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

import { Component, ViewChild, Renderer2  } from '@angular/core';
import { IonicPage, NavParams, Slides, ViewController, ToastController } from 'ionic-angular';
import { IrisProvider, Incident } from '../../providers/iris/iris';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';

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

  constructor(private navParams: NavParams, private view: ViewController, private renderer: Renderer2, private iris: IrisProvider, private irisInfo: IrisInfoProvider, private toastCtrl: ToastController) {
  }

  suppressSelected(){
    this.suppressionCreated = true;
    if (this.allSelected) {
      this.toggleSelectAll();
    }
    // build the suppression request body
    var reqBody = {"nodes":this.selectedNodes, "fabric": this.incident["context"]["fabric"], "comment":this.comment, "user": this.irisInfo.username};
    // add a comment if none was provided
    if (reqBody["comment"].length == 0){
      reqBody["comment"] = "Suppressed from Iris Mobile"
    }
    reqBody["filter"] = this.incident["context"]["filename"] + "/" + this.incident["context"]["name"]


    if (this.suppressionType == "0") {
        // date.parse returns unix timestamp in milliseconds, divide by 1000 to convert into seconds
        reqBody["start"] = Date.parse(this.startTimeAlertClears)/1000;
        reqBody["until_good"] = true;
    }
    else if (this.suppressionType == "1") {
      reqBody["start"] = Date.parse(this.startTime)/1000;;
      reqBody["expiration"] = Date.parse(this.endTime)/1000;;
    }
    else if (this.suppressionType == "2") {
      reqBody["start"] = Date.parse(this.startTimeJira)/1000;;
      reqBody["jira"] = this.jiraTicket;
    }

    this.iris.suppressNodes(reqBody).subscribe(
      (data) => {
        this.createToast('Successfully suppressed nodes')
      },
      (err) => {
        this.createToast('Error: failed to suppress nodes')
      }
    );
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
      tempArray.push(node[0])
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
