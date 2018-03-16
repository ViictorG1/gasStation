import { Component, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { NavController, NavParams, ViewController, Keyboard } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import * as $ from 'jquery';

import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

@Component({
  selector: 'page-gas-station',
  templateUrl: 'gas-station.html'
})
export class GasStationPage implements AfterViewInit {

  @Output() onNavigation: EventEmitter<any> = new EventEmitter<any>();

  gasStation: any = {
    name: "POSTO"
  };
  latlngUser: any;
  editingPrice: any = {};
  mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    private launchNavigator: LaunchNavigator,
    private alertCtrl: AlertController
  ) {
    this.gasStation = this.navParams.get('gasStation');
    this.latlngUser = this.navParams.get('latlngUser');

  }

  ngAfterViewInit() {
    $(".content-gas").click((e: any) => {
      if (e.target.className !== '') {
        if (e.target.className !== 'text-input text-input-ios') {
          this.editingPrice.type = '';
          this.editingPrice.price = '';
          this.editingPrice.newValue = '';
        }
      }
    });
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

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  changeValue(type: string, value: string) {
    this.editingPrice.type = type;
    this.editingPrice.price = value;
  }

  convert(event: any) {
    if (event.key !== 'Backspace') {
      if (event.key !== 'Delete') {
        let elementChecker: string;
        let format = /^([^0-9]*)$/;
        let first = this.editingPrice.newValue.charAt(0);
        elementChecker = event.target.value;
        if (!!format.test(elementChecker)) {
          this.editingPrice.newValue = elementChecker.slice(0, -1);
        } else {
          if (first) {
            if (elementChecker === first) {
              this.editingPrice.newValue += ',';
            } else {
              if (this.editingPrice.newValue.charAt(1) !== ',') {
                let txt = this.editingPrice.newValue.charAt(1);
                let txt2 = '';
                if (this.editingPrice.newValue.charAt(3)) {
                  txt2 = this.editingPrice.newValue.charAt(3);
                }
                this.editingPrice.newValue = this.editingPrice.newValue.slice(0, 1) + "," + txt + txt2;
              }
            }
          }
        }
      }
    }
  }

  handleEnter() {
    this.presentAlert(this.editingPrice);

    setTimeout(() => {
      this.editingPrice.type = '';
      this.editingPrice.price = '';
      this.editingPrice.newValue = '';
    }, 1500);
  }

  presentAlert(editingPrice: any) {
    let gasoline = '';

    switch (editingPrice.type) {
      case 'gc':
        gasoline = 'da Gasolina COMUM';
        break;

      case 'ga':
        gasoline = 'da Gasolina ADITIVADA';
        break;

      case 'di':
        gasoline = 'do DIESEL';
        break;

      case 'et':
        gasoline = 'do ETANOL';
        break;
    }

    let alert = this.alertCtrl.create({
      title: 'Novo valor registrado',
      subTitle: `Obrigado por ajudar a atualizar o valor ${gasoline}, iremos analisar o valor e atualizaremos-o o quanto antes.`,
      buttons: ['OK']
    });

    alert.present();
  }

  closeGasStation() {
    this.navCtrl.pop();
  }
}
