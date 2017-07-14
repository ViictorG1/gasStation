import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Nav, ModalController } from 'ionic-angular';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { HomePage } from '../home/home';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {
  @ViewChild(Nav) nav: Nav;

  gasStations: FirebaseListObservable<any[]>;
  gasStationsList: any[] = [];
  gasStation: any;  
  latlngUser: any;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public geolocation: Geolocation,
    public af: AngularFireDatabase
  ) {
    this.gasStations = af.list('/gasStations');
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

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  calculateDistances(latlngUser: any) {
    this.gasStations.subscribe((gasStations: any) => {
      gasStations.forEach((gasStation: any) => {
        let calcDistance = 
        let resultDistance = this.getDistanceFromLatLonInKm(latlngUser.lat, latlngUser.lng, gasStation.latitude, gasStation.longitude);
        
        if (resultDistance >= 0 && resultDistance <= 1) {
          resultDistance = resultDistance * 1000;
          resultDistance = Math.trunc(resultDistance);
          gasStation.distance = `${resultDistance}m`;
        } else {
          gasStation.distance = `${resultDistance.toFixed(2)}km`;
        }

        this.gasStationsList.push(gasStation);
      });
    });
  }
}
