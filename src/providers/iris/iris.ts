import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Subject, Observable } from 'rxjs';
import { IrisInfoProvider } from '../iris_info/iris_info';
import { forkJoin } from "rxjs/observable/forkJoin";

export class Incident {
  active: boolean;
  application: string;
  context: any;
  created: number;
  current_step: number;
  id: number;
  owner: string;
  plan: string;
  plan_id: number;
  updated: number;
  title: string;
}

export class OncallUser {
  id: number;
  name: string;
  full_name: string;
  time_zone: string;
  photo_url: string;
  active: number;
  god: number;
  contacts: any;
  upcoming_shifts: any;
  teams: any;
}

export class OncallTeam {
  name: string;
  email: string;
  slack_channel: string;
  summary: any;
  services: string[];
  rosters: any;
}

export class GraphData {
  current: string;
  original: string;
}

export class IncidentFilters {
  active: boolean;
  inactive: boolean;
  queryParams: Map<string,string>;

  public clone() {
    let newFilters = new IncidentFilters();
    newFilters.active = this.active;
    newFilters.inactive = this.inactive;
    newFilters.queryParams = new Map(this.queryParams);
    return newFilters;
  }
}

class TokenResponse {
  token: string;
  key_id: string;
  expiry: number;
}

/*
  The Iris provider handles interface with Iris, renewing tokens as needed.
  This provider offers methods for getting incidents, app templates, and
  graph data.
*/
@Injectable()
export class IrisProvider {
  dummyRedirect: string = 'http://localhost:7000';
  apiPath: string = '/api/v0/mobile';
  oncallApiPath: string = '/api/v0/oncall';
  tokenLeeway: number = 600;
  incidents: Map<number, Incident>;
  oncallUsers: Array<OncallUser>;
  oncallTeams: Array<string>;
  oncallServices: Array<string>;
  oncallUsersLoaded: boolean = false;
  oncallTeamsLoaded: boolean = false;
  oncallServicesLoaded: boolean = false;

  constructor(public http: HttpClient, private storage: Storage, private irisInfo: IrisInfoProvider,
    private iab: InAppBrowser) {
      this.incidents = new Map();
      this.oncallUsers = [];
      this.oncallTeams = [];
      this.oncallServices = [];

    }
  
  public initOncallCache() { 
    this.loadOncallUserCache();
    this.loadOncallTeamCache();
    this.loadOncallServiceCache();
  }

  // Ensures valid refresh token, then renews access key
  public renewAccessKey() : Observable<void> {
    const renewKey = () => {
      // Ensure refresh token is valid and fire a refresh request
      this.renewRefreshKey()
      .flatMap(() => this.http.get<TokenResponse>(`${this.irisInfo.baseUrl}${this.apiPath}/refresh`))
      .flatMap(data => {
        // Wait for storage to set all keys before returning
        return Observable.fromPromise(Promise.all([this.storage.set('accessKey', data.token),
        this.storage.set('accessKeyId', data.key_id),
        this.storage.set('accessExpiry', data.expiry)]))
      }).subscribe(
        () => accessSubject.next(),
        () => accessSubject.error('Failed to renew key')
      )
    }

    let accessSubject = new Subject<void>();
    this.storage.ready()
    .then(() => this.storage.get('accessExpiry'))
    .then(expiry => {
      // Check if access token has expired and renew if needed
      if (!expiry || expiry < Date.now() / 1000 + this.tokenLeeway){
        renewKey();
      }
      else {
        // If access token is still valid, signal to observable
        accessSubject.next();
      }
    })
    return accessSubject.asObservable();
  }

  // Ensures refresh key is valid. If expired, open login page for re-auth
  public renewRefreshKey(loggedOut = false) : Observable<void>{
    let refreshSubject = new Subject<void>();

    const handleRedirect = (browser, event) => {
      // Check URL for dummy redirect
      if ((event.url).indexOf(this.dummyRedirect) === 0) {
        let responseParameters = ((event.url).split("#")[1]).split("&"),
        parsedResponse = {};

        // Parse response url
        for (let i = 0; i < responseParameters.length; i++) {
          parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
        }

        // Validate response
        if (parsedResponse.hasOwnProperty('token') && parsedResponse.hasOwnProperty('keyId')
        && parsedResponse.hasOwnProperty('expiry') && parsedResponse.hasOwnProperty('username')) {
          // Set refresh params and broadcast to refresh observable
          Promise.all([this.storage.set('refreshKey', parsedResponse['token']),
          this.storage.set('refreshKeyId', parsedResponse['keyId']),
          this.storage.set('refreshExpiry', parsedResponse['expiry']),
          this.irisInfo.setUsername(parsedResponse['username'])]).then(() => {
            refreshSubject.next();
          });
        } else {
          refreshSubject.error('Invalid token refresh response from API');
        }
        browser.close();
      }
    }

    // Check if refresh token has expired
    this.storage.ready()
    .then(() =>this.storage.get('refreshExpiry'))
    .then((expiry) => {
      let loginUrl = this.irisInfo.loginUrl;
      if (!expiry || expiry < Date.now() / 1000 + this.tokenLeeway){
        // If expired, open in-app browser to login to SSO
        let browserOptions = 'location=no';
        if (loggedOut) {
          browserOptions += ',clearcache=yes'
        }
        let browser = this.iab.create(loginUrl, '_blank', browserOptions);
        // Intercept redirect to populate refresh token params
        browser.on('loadstart').subscribe(
          (event) => {
            handleRedirect(browser, event);
          },
          () => {refreshSubject.error('Failed to open login page')}
        );
        browser.on('exit').subscribe(
          () => {
            this.storage.get('refreshExpiry')
            .then((expiry) => {
              // If refresh token hasn't been refreshed, error out
              if (!expiry || expiry < Date.now() / 1000 + this.tokenLeeway) {
                refreshSubject.error('Login window closed');
              }
            })
          }
        )
      } else {
        refreshSubject.next();
      }
    })
    return refreshSubject.asObservable();
  }

  public clearIncidents() {
    this.incidents.clear();
  }

  // get list of all active oncall users
  public getOncallUsers() : Observable<OncallUser[]> {
    let params = {},
    startObservable = this.renewAccessKey();

    // Get users according to params
    var returnObservable = startObservable
      .flatMap(() => this.http.get<OncallUser[]>(`${this.irisInfo.baseUrl}${this.oncallApiPath}/users?fields=name&fields=full_name`, { params: new HttpParams({fromObject: params}) }));

    return returnObservable.map(
      (users) => {
            this.oncallUsers = users.sort((a, b) => {if(b.name > a.name){return -1;}else{return 1;}});
            this.refreshOncallUserCache();
            this.oncallUsersLoaded = true;
            return this.oncallUsers;
          }
      );

  }

  // get get full oncall user
  public getOncallUser(username) : Observable<OncallUser> {

    let startObservable = this.renewAccessKey(),
    user_get = this.http.get(`${this.irisInfo.baseUrl}${this.oncallApiPath}/users/${username}`),
    teams_get = this.http.get(`${this.irisInfo.baseUrl}${this.oncallApiPath}/users/${username}/teams`),
    shifts_get = this.http.get(`${this.irisInfo.baseUrl}${this.oncallApiPath}/users/${username}/upcoming`);

    // Get all user data from multiple api endpoints
    var returnObservable = startObservable
      .flatMap(() => forkJoin([user_get, shifts_get, teams_get]));

    return returnObservable.map(
      (data) => {
            let user = new OncallUser;
            user.id = data[0]['id'];
            user.name = data[0]['name'];
            user.full_name = data[0]['full_name'];
            user.time_zone = data[0]['time_zone'];
            user.photo_url = data[0]['photo_url'];
            user.active = data[0]['active'];
            user.god = data[0]['god'];
            user.contacts = data[0]['contacts'];
            user.upcoming_shifts = data[1];
            user.teams = data[2];
            return user;
          }
      );
  }

  // encode user array as string to persist in local storage
  public refreshOncallUserCache(){

    this.storage.ready()
    .then(() => {
      this.storage.set('oncallUserArray', JSON.stringify(this.oncallUsers));
    })

  }

  // if there is a cached copy of the oncall user array load it
  public loadOncallUserCache(){
    this.oncallUsersLoaded = false;

    this.storage.ready()
    .then(() => {
      this.storage.get('oncallUserArray').then((val) => {
        if(val){
          this.oncallUsers = JSON.parse(val);
          this.oncallUsersLoaded = true;
        }
      });
    })
  }

  // get list of all active oncall teams
  public getOncallTeams() : Observable<string[]> {
    let params = {},
    startObservable = this.renewAccessKey();

    // Get teams according to params
    var returnObservable = startObservable
      .flatMap(() => this.http.get<string[]>(`${this.irisInfo.baseUrl}${this.oncallApiPath}/teams?fields=name`, { params: new HttpParams({fromObject: params}) }));

    return returnObservable.map(
      (teams) => {
        this.oncallTeams = teams.sort();
            this.refreshOncallTeamCache();
            this.oncallTeamsLoaded = true;
            return this.oncallTeams;
          }
      );
  }

    // get full oncall team
    public getOncallTeam(team_name) : Observable<OncallTeam> {

      let startObservable = this.renewAccessKey(),
      team_get = this.http.get(`${this.irisInfo.baseUrl}${this.oncallApiPath}/teams/${team_name}`),
      summary_get = this.http.get(`${this.irisInfo.baseUrl}${this.oncallApiPath}/teams/${team_name}/summary`);
  
      // Get all user data from multiple api endpoints
      var returnObservable = startObservable
        .flatMap(() => forkJoin([team_get, summary_get]));
      
      return returnObservable.map(
        (data) => {
              let team = new OncallTeam;
              team.name = data[0]['name'];
              team.email = data[0]['email'];
              team.slack_channel = data[0]['slack_channel'];
              team.summary = data[1];
              team.services = data[0]['services'];
              team.rosters = data[0]['rosters'];
              return team;
            }
        );
    }
  
  // encode team array as string to persist in local storage
  public refreshOncallTeamCache(){

    this.storage.ready()
    .then(() => {
      this.storage.set('oncallTeamArray', JSON.stringify(this.oncallTeams));
    })

  }

  // if there is a cached copy of the oncall team array load it
  public loadOncallTeamCache(){
    this.oncallTeamsLoaded = false;

    this.storage.ready()
    .then(() => {
      this.storage.get('oncallTeamArray').then((val) => {
        if(val){
          this.oncallTeams = JSON.parse(val);
          this.oncallTeamsLoaded = true;
        }
      });
    })
  }

  // get list of all active oncall services
  public getOncallServices() : Observable<string[]> {
    let params = {},
    startObservable = this.renewAccessKey();

    // Get services according to params
    var returnObservable = startObservable
      .flatMap(() => this.http.get<string[]>(`${this.irisInfo.baseUrl}${this.oncallApiPath}/services`, { params: new HttpParams({fromObject: params}) }));

    return returnObservable.map(
      (services) => {
        this.oncallServices = services.sort();
            this.refreshOncallTeamCache();
            this.oncallServicesLoaded = true;
            return this.oncallServices;
          }
      );
  }

  public getOncallService(service) : Observable<string[]> {
    let startObservable = this.renewAccessKey();

    // Get service according to params
    var returnObservable = startObservable
      .flatMap(() => this.http.get<string[]>(`${this.irisInfo.baseUrl}${this.oncallApiPath}/services/${service}/teams`));

    return returnObservable;

  }


  // encode service array as string to persist in local storage
  public refreshOncallServiceCache(){

    this.storage.ready()
    .then(() => {
      this.storage.set('oncallServiceArray', JSON.stringify(this.oncallServices));
    })

  }

  // if there is a cached copy of the oncall service array load it
  public loadOncallServiceCache(){
    this.oncallServicesLoaded = false;

    this.storage.ready()
    .then(() => {
      this.storage.get('oncallServiceArray').then((val) => {
        if(val){
          this.oncallServices = JSON.parse(val);
          this.oncallServicesLoaded = true;
        }
      });
    })
  }

  
  public getOncallPinnedTeams(username) : Observable<string[]> {
    
    let startObservable = this.renewAccessKey();

    // Get pinned teams according to params
    var returnObservable = startObservable
      .flatMap(() => this.http.get<string[]>(`${this.irisInfo.baseUrl}${this.oncallApiPath}/users/${username}/pinned_teams`));

    return returnObservable;
  }

  // Get incident info from filters specified.
  public getIncidents(filters: IncidentFilters) : Observable<Incident[]> {
    let params = {},
    startObservable = this.renewAccessKey();

    // Set up incident call params based on filters
    filters.queryParams.forEach((value, key) => params[key] = value)

    if (!filters.active) {
      params['active'] = '0';
    } else if (!filters.inactive) {
      params['active'] = '1';
    }

    // Get incidents according to params
    var returnObservable = startObservable
      .flatMap(() => this.http.get<Incident[]>(`${this.irisInfo.baseUrl}${this.apiPath}/incidents`, { params: new HttpParams({fromObject: params}) }));

    return returnObservable
      .do(incidents => {
        for (let i of incidents) {
          // TODO: consider removing
          i.title = i.title ? i.title : i.context['name'];
          this.incidents.set(i.id, i);
        }
      });
  }

  public getIncident(incidentId: number) {
    if (this.incidents.has(incidentId)) {
      return Observable.of(this.incidents.get(incidentId));
    }
    return this.renewAccessKey()
      .flatMap(() => this.http.get<Incident>(`${this.irisInfo.baseUrl}${this.apiPath}/incidents/${incidentId}`))
      .do((incident) => {
        // TODO: consider removing
        incident.title = incident.title ? incident.title : incident.context['name'];
        this.incidents.set(incident.id, incident);
      });
  }

  // Claim incidents with specified ids
  public claim(incidents: Array<Incident>) {
    if (incidents.length == 0) {
      return Observable.of(null);
    }
    let incidentIds = incidents.map(x => x.id);
    return this.renewAccessKey()
      .flatMap(() => this.http.post(`${this.irisInfo.baseUrl}${this.apiPath}/incidents/claim`, {'incident_ids':incidentIds, 'owner': this.irisInfo.username}))
      .do(() => incidents.forEach((i) => {i.active = false; i.owner = this.irisInfo.username}))
  }

  public claimById(incidentId) {
    return this.renewAccessKey()
      .flatMap(() => this.http.post(`${this.irisInfo.baseUrl}${this.apiPath}/incidents/${incidentId}`, {'owner': this.irisInfo.username}))
  }

  // Get mobile template for a given app
  public getTemplate(app: string) {
    return this.renewAccessKey()
      .flatMap(() => this.http.get(`${this.irisInfo.baseUrl}${this.apiPath}/applications/${app}`))
  }

  // Get current/original graphs given a source
  public getGraph(source) {
    const options = { params: new HttpParams().set('graph_url', source)}
    return this.renewAccessKey().flatMap(() => this.http.get(`${this.irisInfo.baseUrl}${this.apiPath}/graph`, options))
  }

  // Suppress alerts
  public suppressNodes(incidentId) {
    return this.renewAccessKey().flatMap(() => this.http.post(`${this.irisInfo.baseUrl}${this.apiPath}/suppress/${incidentId}`, {'owner': this.irisInfo.username}))
  }

  public register(regId: string, platform: string) {
    return this.renewAccessKey().flatMap(
      () => this.http.post(`${this.irisInfo.baseUrl}${this.apiPath}/device`, {'registration_id': regId, 'platform': platform}))
  }

  public debug() {
    let dummy = () => Observable.create(observer => observer.next());
    this.renewAccessKey = dummy;
    this.renewRefreshKey = dummy;
  }
}
