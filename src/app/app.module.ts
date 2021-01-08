import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MyApp } from './app.component';
import { IncidentsPage } from '../pages/incidents/incidents';
import { LoginPage } from '../pages/login/login';
import { OncallPage } from '../pages/oncall/oncall';
import { OncallUserPage } from '../pages/oncall-user/oncall-user';
import { OncallTeamPage } from '../pages/oncall-team/oncall-team';
import { TabsPage } from '../pages/tabs/tabs';
import { FilterModalPage } from '../pages/filter-modal/filter-modal';
import { ApiUrlPage } from '../pages/api-url/api-url';
import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';

import { IncidentContextPage, FormatContextPipe } from '../pages/incident-context/incident-context';
import { IrisProvider } from '../providers/iris/iris';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptor } from '../providers/auth_interceptor/hmac_auth';
import { TemplateProvider } from '../providers/template/template';

import { GraphBlockComponent } from '../components/graph-block/graph-block'
import { IrisInfoProvider } from '../providers/iris_info/iris_info';
import { Push } from '@ionic-native/push';
import { FormsModule } from '@angular/forms';
import { Deeplinks } from '@ionic-native/deeplinks';
import { LogoutProvider } from '../providers/logout/logout';

@NgModule({
  declarations: [
    ApiUrlPage,
    FilterModalPage,
    FormatContextPipe,
    GraphBlockComponent,
    IncidentContextPage,
    IncidentsPage,
    LoginPage,
    MyApp,
    OncallPage,
    OncallTeamPage,
    OncallUserPage,
    PrivacyPolicyPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ApiUrlPage,
    FilterModalPage,
    GraphBlockComponent,
    IncidentContextPage,
    IncidentsPage,
    LoginPage,
    MyApp,
    OncallPage,
    OncallTeamPage,
    OncallUserPage,
    PrivacyPolicyPage,
    TabsPage
  ],
  providers: [
    BarcodeScanner,
    Deeplinks,
    InAppBrowser,
    IrisInfoProvider,
    IrisProvider,
    LogoutProvider,
    Push,
    SplashScreen,
    StatusBar,
    TemplateProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ]
})
export class AppModule {}
