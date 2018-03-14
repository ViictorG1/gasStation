import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { RestClientService } from './rest-client.service';

import { Storage } from '@ionic/storage';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class AuthenticationService extends RestClientService {

  isLoggedIn: boolean = false;
  redirectUrl: string;

  private apiPath: string;
  private apiDevicePath: string;
  private context: any;

  constructor(
    private http: Http
  ) {
    super();
    this.apiPath = 'http://gasin.com.br/auth';
    this.apiDevicePath = 'http://gasin.com.br/devices';
    this.initContext();
  }

  login(email: string, password: string): Observable<boolean> {
    const body = JSON.stringify({ email: email, password: password });
    const url = `${this.apiPath}/sign_in`;

    return this.http
      .post(url, body, this.buildRequestOptions())
      .map((response: Response) => {
        const res = response.headers;
        const user = this.extract<any>(response);

        return {
          isLoggedIn: true,
          user: user,
          password: password,
          token: res.get('access-token'),
          client: res.get('client'),
          uid: res.get('uid')
        };
      })
      .catch(this.handleError);
  }

  getCurrentUser(): any {
    return this.context.user;
  }

  createDevice(device: any, pushToken: string, context: any) {
    // const body = JSON.stringify({ name: 'Moto G(4)', push_token: '', spec: JSON.stringify({ platform: 'Android', uuid: '46544874848', version: '6.6.2' })});
    const body = JSON.stringify({ name: device.model, push_token: pushToken, spec: device.spec });
    const url = `${this.apiDevicePath}`;

    return this.http
      .post(url, body, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response: Response) => {
        const data = this.extract<any>(response);
        this.saveContext(_.assign(context, { deviceId: data.id }));
        return true;
      })
      .catch(this.handleError);
  }

  getDevice(id: number, context: any) {
    const url = `${this.apiDevicePath}/${id}`;

    return this.http
      .get(url, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response: Response) => {
        const data = this.extract<any>(response);
        console.log(data);
        return true;
      })
      .catch(this.handleError);
  }

  private initContext() {
    const serialized = localStorage.getItem('br.com.gasin');
    this.context = serialized ? JSON.parse(serialized) : null;
    console.log(this.context);
    this.isLoggedIn = !!this.context;
  }

  private saveContext(context: any) {
    this.context = context;
    this.isLoggedIn = context.isLoggedIn;
    const serialized = JSON.stringify(context);
    localStorage.setItem('br.com.gasin', serialized);
  }

  private cleanContext() {
    localStorage.removeItem('br.com.gasin');
  }

}
