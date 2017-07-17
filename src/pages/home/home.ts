import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { ListPage } from '../list/list';
import { GasStationPage } from '../gas-station/gas-station';

import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition, MarkerOptions, Marker } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

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
  gasStation: any;
  backIsHide: boolean = false;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  icons = {
    start: new google.maps.MarkerImage(
    // URL
    'http://i.imgur.com/BpuCNNT.png',
    // (width,height)
    new google.maps.Size( 48, 48 ),
    // The origin point (x,y)
    new google.maps.Point( 0, 0 ),
    // The anchor point (x,y)
    new google.maps.Point( 22, 32 )
    ),
    end: new google.maps.MarkerImage(
    // URL
    'http://i.imgur.com/V2gduDr.png',
    // (width,height)
    new google.maps.Size( 100, 100 ),
    // The origin point (x,y)
    new google.maps.Point( 0, 0 ),
    // The anchor point (x,y)
    new google.maps.Point( 22, 32 )
    )
  };

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

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 10,
      center: this.latlngUser,
      scrollwheel: false
    });

    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 0.5,
        strokeColor: '#488AFF'
      }
    , suppressMarkers: true });

    if (this.gasStation) {
        this.latilong = new LatLng(parseFloat(this.gasStation.latitude), parseFloat(this.gasStation.longitude));
      } else {
        this.latilong = this.latlngUser;
      }

    this.calculateAndDisplayRoute();

    // let element = document.getElementById('map');
    // let map: GoogleMap = this.googleMaps.create(element);

    // map.one(GoogleMapsEvent.MAP_READY).then(() => {
    //   if (this.gasStation) {
    //     this.latilong = new LatLng(parseFloat(this.gasStation.latitude), parseFloat(this.gasStation.longitude));
    //   } else {
    //     this.latilong = this.latlngUser;
    //   }

    //   if (this.gasStation) {
    //     let position: CameraPosition = {
    //       target: this.latilong,
    //       zoom: 15,
    //       tilt: 30,
    //       duration: 500
    //     }

    //     map.moveCamera(position);

    //     let markerOptionsUser: MarkerOptions = {
    //       position: this.latlngUser
    //     };

    //     const markerUser = map.addMarker(markerOptionsUser)
    //       .then((marker: Marker) => {
    //           marker.showInfoWindow();
    //         });

    //     let markerOptionsGas: MarkerOptions = {
    //       position: this.latilong
    //     };

    //     map.on(GoogleMapsEvent.MARKER_CLICK)
    //       .subscribe(() => {
    //         this.addInfoWindow();
    //       });

    //     const marker = map.addMarker(markerOptionsGas)
    //       .then((marker: Marker) => {
    //           marker.addEventListener(GoogleMapsEvent.MARKER_CLICK)
    //             .subscribe(() => {
    //               this.addInfoWindow();
    //             });
    //         });

    //     this.calculateAndDisplayRoute();
      
    //   } else {
    //     let position: CameraPosition = {
    //       target: this.latilong,
    //       zoom: 20,
    //       tilt: 30,
    //       duration: 500
    //     }

    //     map.moveCamera(position);

    //     let markerOptionsUser: MarkerOptions = {
    //       position: this.latlngUser,
    //       title: 'Você'
    //     };

    //     const markerUser = map.addMarker(markerOptionsUser)
    //       .then((marker: Marker) => {              
    //           marker.showInfoWindow();
    //         });
    //   }
    // });
  
  }

  addInfoWindow() {
    let gasStationModal = this.modalCtrl.create(GasStationPage, {
      gasStation: this.gasStation
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
      this.makeMarker(leg.start_location, this.icons.start, 'Sua localização');
      this.makeMarker(leg.end_location, this.icons.end, this.gasStation.name);
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  makeMarker(position, icon, title) {
    let marker = new google.maps.Marker({
      position: position,
      map: this.map,
      icon: icon,
      title: title
    });

    if (!(title === 'Sua localização')) {
      google.maps.event.addListener(marker, 'click', () => {
        this.addInfoWindow();
      });
    }
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
