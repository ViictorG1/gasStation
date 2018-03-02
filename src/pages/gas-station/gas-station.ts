import { Component, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

@Component({
  selector: 'page-gas-station',
  templateUrl: 'gas-station.html'
})
export class GasStationPage {

  @Output() onNavigation: EventEmitter<any> = new EventEmitter<any>();

  gasStation: any = {
    name: "POSTO"
  };
  latlngUser: any;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    private launchNavigator: LaunchNavigator
  ) {
    this.gasStation = this.navParams.get('gasStation');
    this.latlngUser = this.navParams.get('latlngUser');
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  goNavigation() {
    let app;

    if (this.launchNavigator.isAppAvailable(this.launchNavigator.APP.GOOGLE_MAPS)){
      app = this.launchNavigator.APP.GOOGLE_MAPS;
    } else {
      app = this.launchNavigator.APP.USER_SELECT;
    }

    let options: LaunchNavigatorOptions = {
      start: this.latlngUser,
      app: this.launchNavigator.APP.USER_SELECT
    };

    this.launchNavigator.navigate([this.gasStation.latitude, this.gasStation.longitude], options)
      .then(
        success => console.log('Launched navigator'),
        error => console.log('Error launching navigator', error)
      );
  }

}
