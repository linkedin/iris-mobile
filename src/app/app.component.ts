import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;
  @ViewChild(Nav) nav: Nav;

  constructor(public events: Events, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    // navigate to LoginPage and hide tabs
    events.subscribe('user:logout', () => {
      this.nav.push(LoginPage);
      this.rootPage = LoginPage;
    });

    // navigate to tabspage
    events.subscribe('user:login', () => {
      this.nav.push(TabsPage);
      this.rootPage = TabsPage;
    });

  }
}

