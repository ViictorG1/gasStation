import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-gas-station',
  templateUrl: 'gas-station.html'
})
export class GasStationPage {

  gasStation: any = {
    name: "POSTO"
  };

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams
  ) {
  }

  ngAfterViewInit() {
    this.gasStation = this.navParams.get('gasStation');
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}
