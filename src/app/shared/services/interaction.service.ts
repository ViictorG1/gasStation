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

  private collectionPath(deviceId: number): string {
    return `${this.apiPath}/devices/${deviceId}/interactions`;
  }

  private elementPath(deviceId: number, id: number): string {
    return `${this.collectionPath(deviceId)}/${id}`;
  }

}
