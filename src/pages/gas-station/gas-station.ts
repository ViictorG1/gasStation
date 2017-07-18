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
  }

  ngAfterViewInit() {
    this.gasStation = this.navParams.get('gasStation');
    this.latlngUser = this.navParams.get('latlngUser');
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  goNavigation() {
    let options: LaunchNavigatorOptions = {
      start: this.latlngUser,
      app: this.launchNavigator.APP.GOOGLE_MAPS
    };

    this.launchNavigator.navigate([this.gasStation.latitude, this.gasStation.longitude], options)
      .then(
        success => console.log('Launched navigator'),
        error => console.log('Error launching navigator', error)
      );
  }

}
