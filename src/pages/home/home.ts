import { NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';
import { Component, ViewChild, ElementRef } from '@angular/core';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

import { ListPage } from '../list/list';
import { GasStationPage } from '../gas-station/gas-station';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;

  map: any;
  latlngUser: any;
  latilong: any;
  listPage = { title: 'List', component: ListPage };
  loading: any;
  gasStation: any;
  backIsHide: boolean = false;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  icons = {
    start: new google.maps.MarkerImage(
    // URL
    'assets/images/vol.png',
    // (width,height)
    new google.maps.Size( 48, 48 ),
    // The origin point (x,y)
    new google.maps.Point( 0, 0 ),
    // The anchor point (x,y)
    new google.maps.Point( 22, 32 )
    ),
    end: new google.maps.MarkerImage(
    // URL
    'http://i.imgur.com/svzzuiv.png',
    // (width,height)
    new google.maps.Size( 48, 48 ),
    // The origin point (x,y)
    new google.maps.Point( 0, 0 ),
    // The anchor point (x,y)
    new google.maps.Point( 25, 40 )
    )
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public geolocation: Geolocation
  ) {
    this.presentLoadingDefault();
    this.getMap();
  }

  openList() {
    this.navCtrl.popToRoot();
  }

  loadMap() {
    this.gasStation = this.navParams.get('gasStation') || undefined;
    this.backIsHide = this.navParams.get('backIsHide') || false;

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 10,
      center: this.latlngUser,
      scrollwheel: false
    });
    
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setOptions({
      polylineOptions: {
        strokeWeight: 3,
        strokeOpacity: 0.9,
        strokeColor: '#488AFF'
      }
    , suppressMarkers: true });

    if (this.gasStation) {
        this.latilong = new LatLng(parseFloat(this.gasStation.latitude), parseFloat(this.gasStation.longitude));
      } else {
        this.latilong = this.latlngUser;
      }

    this.loading.dismiss();
    
    this.calculateAndDisplayRoute();
  }

  addInfoWindow() {
    let gasStationModal = this.modalCtrl.create(GasStationPage, {
      gasStation: this.gasStation,
      latlngUser: this.latlngUser
    });
    gasStationModal.present();
  }

  calculateAndDisplayRoute() {
    this.directionsService.route({
      origin: this.latlngUser,
      destination: this.latilong,
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC
    }, (response, status) => {
      let leg = response.routes[0].legs[0];
      // this.makeMarker(leg.start_location, this.icons.start, 'Sua localização');
      this.makeMarker(leg.end_location, this.icons.end, this.gasStation.name);
      this.addInfoWindow();
      // if (status === 'OK') {
      //   this.directionsDisplay.setDirections(response);
      // } else {
      //   window.alert('Directions request failed due to ' + status);
      // }
    });
  }

  makeMarker(position, icon, title) {
    let marker = new google.maps.Marker({
      position: position,
      map: this.map,
      icon: icon,
      title: title
    });

    google.maps.event.addListener(marker, 'click', () => {
      this.addInfoWindow();
    });
  }

  getMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latlngUser = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.loadMap();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      content: 'Carregando mapa'
    });

    this.loading.present();
  }

}
