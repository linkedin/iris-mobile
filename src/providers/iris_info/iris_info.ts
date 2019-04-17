import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class IrisInfoProvider {

  public baseUrl: string;
  public username: string;
  public loginUrl: string;
  configBaseUrl: string = process.env.IRIS_BASE_URL;
  configLoginUrl: string = process.env.LOGIN_URL;

  constructor(public storage: Storage) {
    this.baseUrl = this.configBaseUrl;
    this.loginUrl = this.configLoginUrl;
  }

  public init() {
    return this.storage.ready()
      .then(() => Promise.all([this.storage.get('baseUrl'), this.storage.get('username'), this.storage.get('loginUrl')]))
      .then(([baseUrl, username, loginUrl]) => {
        if (this.configBaseUrl === undefined) {
          this.baseUrl = baseUrl;
        }
        if (this.configLoginUrl === undefined) {
          this.loginUrl = loginUrl;
        }
        this.username = username;
    })
  }

  public setLoginUrl(url: string) {
    this.loginUrl = url
    return this.storage.ready().then(() => this.storage.set('loginUrl', url))
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url
    return this.storage.ready().then(() => this.storage.set('baseUrl', url))
  }

  public setUsername(username: string) {
    this.username = username
    return this.storage.ready().then(() => this.storage.set('username', username))
  }

}
