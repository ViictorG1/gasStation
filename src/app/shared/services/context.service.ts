import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Injectable()
export class ContextService {
  contextChangesSubject: BehaviorSubject<any>;
  contextChanges$: Observable<any>;

  private context: any;

  constructor() {
    this.contextChangesSubject = new BehaviorSubject<any>(this.context);
    this.contextChanges$ = this.contextChangesSubject.asObservable();

    this.initContext();
  }

  updateContext(context) {
    this.contextChangesSubject.next(_.assign(context, { update: true }));
  }

  private initContext() {
    let serialized = localStorage.getItem('br.com.gasin');
    let context = serialized ? JSON.parse(serialized) : {};

    if (context.isLoggedIn && context.user) {
      this.context = context;
      this.contextChangesSubject.next(_.assign(this.context, { update: false }));
    } else {
      localStorage.removeItem('br.com.gasin');
      this.announceAuthenticationFailure();
    }
  }

  private announceAuthenticationFailure() {
    this.context = <any>{ isLoggedIn: false };
    this.contextChangesSubject.next(this.context);
  }

}
