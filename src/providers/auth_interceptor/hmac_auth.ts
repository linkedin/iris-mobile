import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import { IrisInfoProvider } from '../iris_info/iris_info';

/*
  Generated class for the IrisProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private storage: Storage, private irisInfo: IrisInfoProvider){}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let path = request.urlWithParams.slice(this.irisInfo.baseUrl.length),
    tokenKey = 'accessKey',
    keyIdKey = 'accessKeyId';
    // For token refresh, HMAC with refresh key
    if (path === '/api/v0/mobile/iris/refresh') {
      tokenKey = 'refreshKey';
      keyIdKey = 'refreshKeyId';
    }
    return Observable.fromPromise(
      this.storage.ready()
      .then(() => Promise.all([this.storage.get(tokenKey), this.storage.get(keyIdKey)]))
      .then(([key, keyId]) => {
        // Calculate HMAC text
        let expWindow = (Date.now() / 1000) | 0,
        body = request.serializeBody() || '',
        text = `${expWindow} ${request.method} ${path} ${body}`,
        digest = Base64.stringify(hmacSHA512(text, key));

        // Do URL-safe base 64 encoding (replace + and / with - and _, respectively)
        let b64Digest = digest.replace(/\+/g, '-').replace(/\//g, '_');

        // Set headers on request
        request = request.clone({
          setHeaders: {
            Authorization: `signature=${b64Digest},keyId=${keyId},timestamp=${expWindow}`,
          }
        });
        return request;
      })
    ).flatMap(req => {
      return next.handle(req);
    })
  }
}
