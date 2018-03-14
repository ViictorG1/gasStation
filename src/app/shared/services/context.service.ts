import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

// import { Context } from '../context';
import { UserService } from './user.service';

@Injectable()
export class ContextService {
  contextChangesSubject: BehaviorSubject<any>;
  contextChanges$: Observable<any>;

  private context: any;

  constructor(
    private usersService: UserService
  ) {
    this.contextChangesSubject = new BehaviorSubject<any>(this.context);
    this.contextChanges$ = this.contextChangesSubject.asObservable();

    this.initContext();
  }

  private initContext() {
    let serialized = localStorage.getItem('br.com.gasin');
    let context = serialized ? JSON.parse(serialized) : {};

    if (context.isLoggedIn && context.user) {
      this.context = context;
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
