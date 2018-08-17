import { Component, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { AlertController } from 'ionic-angular';
import * as $ from 'jquery';

import { InteractionService } from '../../app/shared/services/interaction.service';
import { PlaceService } from '../../app/shared/services/place.service';

@Component({
  selector: 'page-gas-station',
  templateUrl: 'gas-station.html'
})
export class GasStationPage implements AfterViewInit {

  @Output() onNavigation: EventEmitter<any> = new EventEmitter<any>();

  context: any;

  countToDelete = 0;

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
    private alertCtrl: AlertController,
    private cd: ChangeDetectorRef,
    private launchNavigator: LaunchNavigator,
    private interactionService: InteractionService,
    private placeService: PlaceService
  ) {
    this.gasStation = this.navParams.get('gasStation');
    this.latlngUser = this.navParams.get('latlngUser');
    this.context = this.navParams.get('context');
  }

  ngAfterViewInit() {
    $(".content-gas").click((e: any) => {
      if (e.target.className !== '') {
        if (e.target.className !== 'text-input text-input-ios') {
          if (e.target.className !== 'rs') {
            this.editingPrice.type = '';
            this.editingPrice.price = '';
            this.editingPrice.newValue = '';
            this.cd.detectChanges();
          }
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

    const options: LaunchNavigatorOptions = {
      start: this.latlngUser,
      app: this.launchNavigator.APP.USER_SELECT
    };

    this.launchNavigator.navigate([this.gasStation.latitude, this.gasStation.longitude], options)
      .then(
        success => console.warn('Launched navigator'),
        error => console.warn('Error launching navigator', error)
      );
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  changeValue(type: string, value: string) {
    this.editingPrice.type = type;
    this.editingPrice.price = value;
    this.cd.detectChanges();
  }

  updateFlag(newFlag: string) {
    this.gasStation.flag = 'Shell';
    this.placeService.updatePlace(this.gasStation, this.context)
      .subscribe((gasStation: any) => {
        this.cd.detectChanges();
      }, (error: Error) => {
        console.warn(error);
      });
  }

  handleEnter() {
    this.presentAlert(this.editingPrice);
    if (this.editingPrice.length == 2) {
      this.editingPrice = this.editingPrice + "99";
    } else if (this.editingPrice.length == 3) {
      this.editingPrice = this.editingPrice + "9";
    }

    (this.editingPrice.type === 'gc') ? this.editingPrice.newValue * 1000 : this.gasStation.values.find(x => x.type === 'GC').value * 1000

    const interaction = {
      device_id: this.context.deviceId,
      interaction_type_id: "801",
      place_id: this.gasStation.id,
      description: [
        { short: 'GC', label: 'Gasolina Comum', amount: (this.editingPrice.type === 'gc') ? this.editingPrice.newValue * 1000 : this.gasStation.values.find(x => x.type === 'GC').value * 1000 },
        { short: 'GA', label: 'Gasolina Aditivada', amount: (this.editingPrice.type === 'ga') ? this.editingPrice.newValue * 1000 : this.gasStation.values.find(x => x.type === 'GA').value * 1000 },
        { short: 'DI', label: 'Diesel', amount: (this.editingPrice.type === 'di') ? this.editingPrice.newValue * 1000 : this.gasStation.values.find(x => x.type === 'DI').value * 1000 },
        { short: 'ET', label: 'Etanol', amount: (this.editingPrice.type === 'et') ? this.editingPrice.newValue * 1000 : this.gasStation.values.find(x => x.type === 'ET').value * 1000 },
        { short: 'GNV', label: 'Gás Natural Veicular', amount: (this.editingPrice.type === 'gnv') ? this.editingPrice.newValue * 1000 : this.gasStation.values.find(x => x.type === 'GNV').value * 1000 }
      ]
    }
    this.interactionService.createInteraction(interaction, this.context)
      .subscribe((data: any) => {
      }, (error: Error) => {
        console.warn(error);
      });

    setTimeout(() => {
      this.editingPrice.type = '';
      this.editingPrice.price = '';
      this.editingPrice.newValue = '';
    }, 1000);
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

  countingToDelete() {
    this.countToDelete++;

    if (this.countToDelete == 4) {
      this.gasStation.is_visible = false;
      this.placeService
        .updatePlace(this.gasStation, this.context)
        .subscribe(() => {
          this.countToDelete = 0;
        }, (error) => {
          console.warn(error);
        });
    }
  }

  closeGasStation() {
    this.navCtrl.pop();
  }
}
