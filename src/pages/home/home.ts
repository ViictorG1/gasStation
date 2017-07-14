import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { ListPage } from '../list/list';
import { GasStationPage } from '../gas-station/gas-station';

import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition, MarkerOptions, Marker } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  latlngUser: any;
  latilong: any;
  listPage = { title: 'List', component: ListPage };
  gasStation: any;
  backIsHide: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public geolocation: Geolocation,
    private googleMaps: GoogleMaps    
  ) {
    this.getMap();
  }

  openList() {
    this.navCtrl.popToRoot();
  }

  loadMap() {
    this.gasStation = this.navParams.get('gasStation') || undefined;
    this.backIsHide = this.navParams.get('backIsHide') || false;

    let element = document.getElementById('map');
    let map: GoogleMap = this.googleMaps.create(element);

    map.one(GoogleMapsEvent.MAP_READY).then(() => {
      if (this.gasStation) {
        this.latilong = new LatLng(parseFloat(this.gasStation.latitude), parseFloat(this.gasStation.longitude));
      } else {
        this.latilong = this.latlngUser;
      }

      if (this.gasStation) {
        let position: CameraPosition = {
          target: this.latilong,
          zoom: 15,
          tilt: 30,
          duration: 500
        }

        map.fromLatLngToPoint(this.latilong);

        map.moveCamera(position);

        let markerOptionsUser: MarkerOptions = {
          position: this.latlngUser
        };

        const markerUser = map.addMarker(markerOptionsUser)
          .then((marker: Marker) => {
              marker.showInfoWindow();
            });

        let markerOptionsGas: MarkerOptions = {
          position: this.latilong
        };

        map.on(GoogleMapsEvent.MARKER_CLICK)
          .subscribe(() => {
            this.addInfoWindow();
          });

        const marker = map.addMarker(markerOptionsGas)
          .then((marker: Marker) => {
              marker.addEventListener(GoogleMapsEvent.MARKER_CLICK)
                .subscribe(() => {
                  this.addInfoWindow();
                });
            });
      
      } else {
        let position: CameraPosition = {
          target: this.latilong,
          zoom: 20,
          tilt: 30,
          duration: 500
        }

        map.moveCamera(position);

        let markerOptionsUser: MarkerOptions = {
          position: this.latlngUser,
          title: 'Você'
        };

        const markerUser = map.addMarker(markerOptionsUser)
          .then((marker: Marker) => {              
              marker.showInfoWindow();
            });
      }
    });
  
  }

  addInfoWindow() {
    let gasStationModal = this.modalCtrl.create(GasStationPage, {
      gasStation: this.gasStation
    });
    gasStationModal.present();
  }


  getMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latlngUser = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.loadMap();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

}
