import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Nav, ModalController, LoadingController } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

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

  map: any;
  gasStations: FirebaseListObservable<any[]>;
  gasStationsList: any[] = [];
  gasStation: any;  
  latlngUser: any;
  directionsService = new google.maps.DirectionsService;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public loading: LoadingController,
    public geolocation: Geolocation,
    public af: AngularFireDatabase
  ) {
    this.presentLoadingDefault();
    this.gasStations = this.af.list('/gasStations');    
    this.getCurrentLocation();
  }

  openGasStation(gasStation: any) {
    this.gasStation = gasStation;

    this.navCtrl.push(HomePage, {
      gasStation: gasStation,
      backIsHide: true
    });
  }

  // presentContactModal(gasStation: any) {
  //   let contactModal = this.modalCtrl.create(GasStationPage, {
  //     gasStation: this.gasStation
  //   });
  //   contactModal.present();
  // }   

  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 }).then((resp) => {
      let latlngUser = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.calculateDistances(latlngUser);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  calculateDistances(latlngUser: any) {
    this.gasStations.subscribe((gasStations: any) => {
      gasStations.forEach((gasStation: any) => {
        this.calculateRoute(latlngUser, gasStation);
      });
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
        gasStation.distance = `${gasStation.distance.toFixed(1)}km`
      } else {
        gasStation.distance = `${gasStation.distance}m`;
      }

      this.gasStationsList.push(gasStation);      
    });
  }

  presentLoadingDefault() {
    let loading = this.loading.create({
      content: 'Carregando postos'
    });

    loading.present();
    this.gasStations = this.af.list('/gasStations');
    setTimeout(() => {
      loading.dismiss();
    }, 4000);
  }
}
