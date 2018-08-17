import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { RestClientService } from '../../shared/services/rest-client.service';

@Injectable()
export class PlaceService extends RestClientService {

  private apiPath: string;

  constructor(
    private http: Http
  ) {
    super();
    this.apiPath = 'http://gasin.com.br';
  }

  getPlaces(context: any, ids: string[]): Observable<any[]> {
    let url = `${this.collectionPath()}?ids=${encodeURIComponent(JSON.stringify(ids))}`;

    return this.http
      .get(url, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response: Response) => {
        const places = this.extract<any[]>(response);
        return places;
      })
      .catch(this.handleError);
  }

  createPlace(data: any, context: any): Observable<any> {
    const body = JSON.stringify(data);

    return this.http
      .post(this.collectionPath(), body, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response: Response) => {
        let responseData = this.extract<any>(response);
        return responseData;
      })
      .catch(this.handleError);
  }

  updatePlace(data: any, context: any): Observable<any> {
    const body = JSON.stringify(this.marshalPlace(data));

    return this.http
      .put(this.elementPath(data.id), body, this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response: Response) => {
        return this.extract<any>(response);
      })
      .catch(this.handleError);
  }

  deletePlace(id: string, context: any): Observable<boolean> {
    return this.http
      .delete(this.elementPath(id), this.buildRequestOptions({}, { uid: context.uid, client: context.client, token: context.token }))
      .map((response) => {
        return true;
      })
      .catch(this.handleError);
  }

  private marshalPlace(place: any): any {
    return {
      created_at:'',
      google_place_id: place.place_id,
      id: place.id,
      is_visible: place.is_visible,
      name: place.name,
      settings: '',
      flag: place.flag,
      updated_at:''
    };
  }

  private collectionPath(): string {
    return `${this.apiPath}/places`;
  }

  private elementPath(id: string) {
    return `${this.collectionPath()}/${id}`;
  }

}
