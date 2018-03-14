import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { RestClientService } from '../../shared/services/rest-client.service';

@Injectable()
export class UserService extends RestClientService {

  private apiPath: string;

  constructor(
    private http: Http
  ) {
    super();
    this.apiPath = 'http://gasin.com.br/auth';
  }

  // getUsers(companyId: string): Observable<any[]> {
  //   const queryParams: any = { domain: companyId };

  //   return this.http
  //     .get(this.collectionPath(), this.buildRequestOptions(queryParams))
  //     .map((response: Response) => {
  //       const users = this.extract<any[]>(response);
  //       return _.sortBy(users, ['name']);
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

  createUser(data: any): Observable<any> {
    const body = JSON.stringify(data);
    console.log(body);

    return this.http
      .post(this.apiPath, body, this.buildRequestOptions())
      .map((response: Response) => {
        let responseData = this.extract<any>(response);
        return this.unmarshalUser(responseData, data.password);
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

  private marshalUser(user: any): any {
    return {
      nickname: user.nickname,
      email: user.email,
      password: user.password
    };
  }

  private unmarshalUser(responseData: any, password: string): any {
    return {
      id: responseData.data.id,
      nickname: responseData.data.nickname,
      email: responseData.data.email,
      password: password
    };
  }


  // private collectionPath(): string {
  //   return `${this.apiPath}/users`;
  // }

  // private elementPath(id: number): string {
  //   return `${this.collectionPath()}/${id}`;
  // }

}
