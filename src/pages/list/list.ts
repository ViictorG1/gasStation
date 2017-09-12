import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Nav, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { FirebaseService } from '../firebase.service';
import { HomePage } from '../home/home';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {
  @ViewChild(Nav) nav: Nav;

  change: any;
  map: any;
  gasStationsList: any[] = [];
  loading: any;
  gasStation: any;
  latlngUser: any;
  directionsService = new google.maps.DirectionsService;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    private firebaseService: FirebaseService,
    private storage: Storage
  ) {
    this.presentLoadingDefault();
  }

  openGasStation(gasStation: any) {
    this.gasStation = gasStation;

    this.navCtrl.push(HomePage, {
      gasStation: gasStation,
      backIsHide: true,
      gasStations: this.gasStationsList
    });
  }

  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 }).then((resp) => {
      let latlngUser = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.calculateDistances(latlngUser);
    }).catch((error) => {
      let alert = this.alertCtrl.create({
        title: 'Erro!',
        subTitle: 'Ocorreu um erro ao tentar buscar a sua localização.',
        buttons: [{
          text: 'Tente novamente',
          handler: data => {
            this.presentLoadingDefault();
          }
        }]
      });

      alert.present();
    });
  }

  calculateDistances(latlngUser: any) {
    this.gasStationsList.forEach((gasStation: any) => {
      this.calculateRoute(latlngUser, gasStation);
    });
  }

  calculateRoute(latlngUser: any, gasStation: any) {
    this.directionsService.route({
      origin: latlngUser,
      destination: new LatLng(gasStation.latitude, gasStation.longitude),
      travelMode: 'DRIVING'
    }, (response, status) => {
      gasStation.distance = response.routes[0].legs[0].distance.value;

      if (gasStation.distance >= 1000) {
        gasStation.distance = gasStation.distance / 1000;
        gasStation.distance = `${gasStation.distance.toFixed(1)}km`;
      } else {
        gasStation.distance = `${gasStation.distance}m`;
      }    
    });
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      content: 'Carregando postos'
    });

    this.checkChanges();    

    this.loading.present();
    
    let lengthData: number;
    this.storage.length().then((length: number) => {
      lengthData = length;
      this.loadData(lengthData);
    })

    this.loading.dismiss();
  }

  loadData(lengthData) {
    if (lengthData <= 0) {
      this.loadGasStations();
    } else {
      this.storage.get('gasStations').then((data: any) => {
        this.gasStationsList = data;
      });
    }

    this.getCurrentLocation();
  }

  checkChanges() {    
    let changes = this.firebaseService.getChanges();
    changes.subscribe((changesAux: any) => {
      changesAux.forEach((dataChange: any) => {
        if (dataChange.value) {
          this.change = dataChange;
          this.onChangeAccept();
        }
      });
    });
  }

  onChangeAccept() {
    this.loadGasStations();
    this.firebaseService.setChangeToFalse(this.change.data);
    this.change.value = false;
    this.change.data = "";
  }

  loadGasStations() {
    let gasStations = this.firebaseService.getGasStationsList();
    gasStations.subscribe((gasStations: any) => {
      this.gasStationsList = gasStations;
      this.storage.set('gasStations', this.gasStationsList);
    });

    this.getCurrentLocation();
  }

}
