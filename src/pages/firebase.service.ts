import { Injectable } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Injectable()
export class FirebaseService {

  gasStations: FirebaseListObservable<any[]>;
  changes: FirebaseListObservable<any[]>; 
  private apiPath: string;

  constructor(
    public af: AngularFireDatabase,
  ) {
    this.changes = this.af.list('/changes');
  }

  getGasStationsList() {
    return this.gasStations = this.af.list('/gasStations');
  }

  getChanges() {
    return this.changes;
  }

  setChangeToFalse(changeValue: string) {
    this.changes.update(`${changeValue}change`, {
      value: false
    });
  }

}
