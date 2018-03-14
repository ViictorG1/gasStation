import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Injectable()
export class RestClientService {

  extract<T>(response: Response): T {
    return <T>response.json();
  }

  buildRequestOptions(queryParams: any = {}, moreHeaders?: any): RequestOptions {
    let headers: Headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
      'access-token': moreHeaders ? moreHeaders.token : this.getAuthToken(),
      'uid': moreHeaders ? moreHeaders.uid : '',
      'client': moreHeaders ? moreHeaders.client : '',
    });

    let params: URLSearchParams = new URLSearchParams();

    _.forEach((queryParams), (value: any, key: string) => {
      if (_.isArray(value)) {
        _.forEach((value), (v: string) => {
          params.append(`${key}[]`, v);
        });
      } else {
        params.set(key, value);
      }
    });

    return new RequestOptions({ headers: headers, search: params });
  }

  urlEncode(data: any): string {
    let urlSearchParams = new URLSearchParams();

    for (let key in data) {
      urlSearchParams.append(key, data[key]);
    }

    return urlSearchParams.toString();
  }

  handleError(error: Error, caught: Observable<any>) {
    let errMsg = error.message || 'Server error';
    return Observable.throw(errMsg);
  }

  protected getAuthToken() {
    let serialized = localStorage.getItem('br.com.gasin');
    let context = serialized ? JSON.parse(serialized) : null;
    console.log(context)

    if (context) {
      return context.token;
    }

    return 'no-token';
  }

}
