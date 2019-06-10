import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { IrisInfoProvider } from '../../providers/iris_info/iris_info';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';


/**
 * Page for setting custom Iris URL. Allows scanning QR code for easy input.
 */

@Component({
  selector: 'page-api-url',
  templateUrl: 'api-url.html',
})
export class ApiUrlPage {
  baseUrl: string;
  loginUrl: string;
  scannedData: any;
  barcodeScannerOptions: BarcodeScannerOptions;
  loading: boolean;

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, private storage: Storage,
    private barcodeScanner: BarcodeScanner, private toastCtrl: ToastController, private info: IrisInfoProvider) {
    this.barcodeScannerOptions = {
      showTorchButton: true,
      showFlipCameraButton: true
    };
    this.loading = true;
  }

  scanCode() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.scannedData = barcodeData.text.split(",", 2);
      this.baseUrl = this.scannedData[0];
      this.loginUrl = this.scannedData[1];
    }).catch(err => {
      console.log('Error', err);
    });
  }

  setBaseUrl(){
    if (this.baseUrl && this.loginUrl) {
      this.storage.ready().then(() => {
        this.info.setBaseUrl(this.baseUrl);
        this.info.setLoginUrl(this.loginUrl);
        this.events.publish('user:logout');
      })
    }
    else {
      let toast = this.toastCtrl.create({
        message: "Error: Both fields must be filled out!",
        duration: 3000,
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: 'OK'
      });
      toast.present();
    }
  }

  ionViewDidLoad() {
    this.storage.ready().then(() => {
      this.storage.get('baseUrl').then(data => {
        if (data) {
          this.events.publish('user:logout');
        } else {
          this.loading = false;
        }
      });
    });
  }
}
