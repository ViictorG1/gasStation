import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { RestClientService } from '../../shared/services/rest-client.service';

@Injectable()
export class InteractionService extends RestClientService {

  private apiPath: string;

  constructor(
    private http: Http
  ) {
    super();
    this.apiPath = 'http://gasin.com.br';
  }

  // getPlaces(context: any): Observable<any[]> {
  //   return this.http
  //     .get(this.apiPath, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
  //     .map((response: Response) => {
  //       const places = this.extract<any[]>(response);
  //       return places;
  //     })
  //     .catch(this.handleError);
  // }

  // getUser(id: number): Observable<any> {
  //   return this.http
  //     .get(this.elementPath(id), this.buildRequestOptions())
  //     .map((response: Response) => {
  //       return this.extract<any>(response);
  //     })
  //     .catch(this.handleError);
  // }

  createInteraction(data: any, context:any): Observable<any> {
    const body = JSON.stringify(data);

    return this.http
      .post(this.collectionPath(context.deviceId), body, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response: Response) => {
        let responseData = this.extract<any>(response);
        return responseData;
      })
      .catch(this.handleError);
  }

  // updateUser(data: any): Observable<any> {
  //   const body = JSON.stringify(this.marshalUser(data));

  //   return this.http
  //     .put(this.elementPath(data.id), body, this.buildRequestOptions())
  //     .map((response: Response) => {
  //       return this.extract<any>(response);
  //     })
  //     .catch(this.handleError);
  // }

  // deleteUser(id: number): Observable<boolean> {
  //   return this.http
  //     .delete(this.elementPath(id), this.buildRequestOptions())
  //     .map((response: Response) => {
  //       return true;
  //     })
  //     .catch(this.handleError);
  // }

  // changeUserPassword(currentPassword: string, newPassword: string): Observable<boolean> {
  //   const url = `${this.collectionPath()}/change_password`;
  //   const body = JSON.stringify({
  //     current_password: currentPassword,
  //     new_password: newPassword
  //   });

  //   return this.http
  //     .put(url, body, this.buildRequestOptions())
  //     .map((response: Response) => {
  //       return true;
  //     })
  //     .catch(this.handleError);
  // }

  // private marshalPlace(user: any): any {
  //   return {
  //     nickname: user.nickname,
  //     email: user.email,
  //     password: user.password
  //   };
  // }

  // private unmarshalPlaces(responseData: any, password: string): any {
  //   return {
  //     id: responseData.data.id,
  //     nickname: responseData.data.nickname,
  //     email: responseData.data.email,
  //     password: password
  //   };
  // }


  private collectionPath(deviceId: number): string {
    return `${this.apiPath}/devices/${deviceId}/interactions`;
  }

  private elementPath(deviceId: number, id: number): string {
    return `${this.collectionPath(deviceId)}/${id}`;
  }

}
