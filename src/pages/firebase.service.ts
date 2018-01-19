import { Injectable } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Injectable()
export class FirebaseService {

  gasStations: FirebaseListObservable<any[]>;
  changes: FirebaseListObservable<any[]>; 

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

  postGasStations(data: any) {
    let type = '';

    if (data.name.includes('Ipiranga')) {
      type = 'Ipiranga';
    } else if (data.name.includes('Shell')) {
      type = 'Shell';
    } else if (data.name.includes('BR')) {
      type = 'BR';
    } else {
      type = 'UNDEFINED';
    }

    this.af.list('/gasStations').push({
      id: data.id,
      name: data.name,
      location: data.formatted_address,
      type: type,
      latitude: data.geometry.location.lat(),
      longitude: data.geometry.location.lng()
    });
  }

  setChangeToFalse(changeValue: string) {
    this.changes.update(`${changeValue}change`, {
      value: false
    });
  }

}
