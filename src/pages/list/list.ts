import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, Nav, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/Rx';
import * as _ from 'lodash';

import { ContextService } from '../../app/shared/services/context.service';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { HomePage } from '../index';

import { IntroPage } from '../../pages/intro/intro';

declare var google;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage implements OnInit {

  @ViewChild(Nav) nav: Nav;

  calcDistanceMsg = 'Buscando postos';

  gasStations: any = [];
  gasStationsList: any[] = [];
  gasStation: any;

  map: any;
  latlngUser: LatLng;
  raio = 1000;
  auxRaio = 500;
  trying = 0;
  directionsService = new google.maps.DirectionsService;

  isReloading = false;
  loading: any;
  loadingRoute = false;

  filter: any;
  rating: number;
  orderByAny: any = 'distance';

  service: any;

  types = [
    { type: 'GC', label: 'Gasolina comum', number: 0 },
    { type: 'GA', label: 'Gasolina aditivada', number: 1 },
    { type: 'DI', label: 'Diesel', number: 2 },
    { type: 'ET', label: 'Etanol', number: 3 },
    { type: 'GNV', label: 'Gás natural veicular', number: 4 }
  ];
  typeCounter = 0;
  fuelType: any = { type: 'GC', label: 'Gasolina comum', number: 0 };

  constructor(
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    private cd: ChangeDetectorRef,
    private contextService: ContextService
  ) {
  }

  ngOnInit() {
    this.contextService.contextChanges$.subscribe((context: any) => {
      if (context) {
        if (context.isLoggedIn) {
          let alert = this.alertCtrl.create({
            title: 'CONTEXT!',
            subTitle: `${context.isLoggedIn} | ${context.password} | ${context.token} | ${context.client} | ${context.uid} | ${context.deviceId} | ${context.user.data.email}`,
            buttons: [
              { text: 'Continuar sem localização'}
            ]
          });

          alert.present();
        }
      }
    });
  }

  ionViewDidLoad() {
    this.storage.get('intro-done').then(done => {
      if (!done) {
        this.storage.set('intro-done', true);
        this.navCtrl.setRoot(IntroPage);
      } else {
        this.presentLoadingDefault();
        this.getCurrentLocation();
      }
    });
  }

  doRefresh(refresher?) {
    this.gasStationsList = [];
    this.latlngUser = undefined;
    this.isReloading = true;
    this.typeCounter = 0;
    this.trying = 0;
    this.presentLoadingDefault();
    this.getCurrentLocation();

    if (refresher) {
      setTimeout(() => {
        this.isReloading = false;
        refresher.complete();
      }, 2000);
    }
  }

  openGasStation(gasStation: any) {
    this.gasStation = gasStation;

    this.navCtrl.push(HomePage, {
      gasStation: gasStation,
      backIsHide: true,
      gasStations: this.gasStationsList,
      userLocation: this.latlngUser
    });
  }

  getCurrentLocation() {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 }).then((resp) => {
      let latlngUser = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.latlngUser = latlngUser;
      this.nearbyGasStations();
    }).catch((error) => {
      if ((error.code === 3) && (this.trying !== 3)) {
        this.getCurrentLocation();
        this.trying++;
      } else {
        let alert = this.alertCtrl.create({
          title: 'Erro!',
          subTitle: `Ocorreu um erro ao tentar buscar a sua localização. Código: ${error.code} | ${error.message}`,
          buttons: [
            { text: 'Tente novamente', handler: data => { this.getCurrentLocation() },},
            { text: 'Continuar sem localização'}
          ]
        });

        alert.present();
      }
    });
  }

  calculateDistances(latlngUser: any) {
    this.loadingRoute = true;

    let observableGasStations = Observable.create((observer: Observer<any>) => {
      this.gasStationsList.forEach((gasStation: any) => {
        this.directionsService.route({
          origin: latlngUser,
          destination: new LatLng(gasStation.latitude, gasStation.longitude),
          travelMode: 'DRIVING'
        }, (response, status) => {
          gasStation.distance = response.routes[0].legs[0].distance.value
          observer.next(gasStation);
        });
      });
    });

    observableGasStations.subscribe((gasStation: any) => {
      this.cd.detectChanges();

      let index = this.gasStationsList.indexOf(gasStation);

      if (index >= 0) {
        if (index + 1 === this.gasStationsList.length) {
          this.gasStationsList.forEach((gasStation: any) => {
            this.getPlaceDetails(gasStation.id);
          });
        }
      }
    });

    // Observable.from(this.gasStationsList)
    //   .forEach((gasStation: any) => {
    //     let observable = Observable.create((observer: Observer<any>) => {
    //       this.directionsService.route({
    //         origin: latlngUser,
    //         destination: new LatLng(gasStation.latitude, gasStation.longitude),
    //         travelMode: 'DRIVING'
    //       }, (response, status) => {
    //         if (status == 'OK') {
    //           gasStation.distance = response.routes[0].legs[0].distance.value;
    //           observer.next(gasStation);

    //           let index = this.gasStationsList.indexOf(gasStation);

    //           if (index >= 0) {
    //             this.gasStationsList = this.gasStationsList.splice(index, 1, gasStation);

    //             if (index + 1 === this.gasStationsList.length) {
    //               if (gasStation.distance) {
    //                 console.log('EAE');
    //                 observer.complete();
    //               }
    //             }
    //           }
    //         } else {
    //           console.log(status);
    //         }
    //       });
    //     });

    //     observable.subscribe((gasStation: any) => {
    //       this.loadingRoute = false;
    //     },
    //     () => {},
    //     () => {
    //       if (this.auxRaio > 500) {
    //         this.auxRaio = 500;
    //         this.gasStationsList.length = 1;
    //       } else {
    //         setTimeout(() => {
    //           this.changeFuel();
    //         }, 2500);
    //       }
    //     });
    //   })
    //   .then(() => {
    //     this.gasStationsList.forEach((gasStation: any) => {
    //       this.getPlaceDetails(gasStation.id);
    //     });
    //   });

    this.loading.dismiss();
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      content: this.calcDistanceMsg
    });

    this.loading.present();
  }

  nearbyGasStations() {
    if (this.filter) {
      this.raio = this.filter.distance;
      this.fuelType = this.filter.gasType;
      this.rating = this.filter.rating;
    }

    this.map = new google.maps.Map(document.getElementById('map'));

    let params = {
      location: { lat: this.latlngUser.lat, lng: this.latlngUser.lng },
      radius: this.raio,
      rankby: 'distance',
      type: 'gas_station',
      key: 'AIzaSyC4ac6cxMs7NqDfE7SWRqnJIlbg5PyhWcc'
    }

    this.service = new google.maps.places.PlacesService(this.map);
    this.service.nearbySearch(params, this.processResults.bind(this));
  }

  processResults(results, status, pagination) {
    if (status !== "OK") {
      this.auxRaio = this.auxRaio + 500;

      setTimeout(() => {
        this.findAtLeastOne();
      }, 2000);
      return;
    } else {
      if (this.auxRaio > 500) {
        let place = results[0];
        let type = '';

        if (place.name.toUpperCase().includes('IPIRANGA')) {
          type = 'Ipiranga';
        } else if (place.name.toUpperCase().includes('SHELL')) {
          type = 'Shell';
        } else if (place.name.toUpperCase().toUpperCase().includes('BR') || place.name.toUpperCase().includes('PETROBRAS')) {
          type = 'BR';
        } else {
          type = 'UNDEFINED';
        }

        this.gasStationsList.push({
          id: place.place_id,
          values: [
            { type: 'GC', label: 'Gasolina comum', value: '3,977' },
            { type: 'GA', label: 'Gasolina aditivada', value: '4,099' },
            { type: 'DI', label: 'Diesel', value: '3,369' },
            { type: 'ET', label: 'Etanol', value: '3,159' },
            { type: 'GNV', label: 'Gás natural veicular', value: '0,0' }
          ],
          name: place.name,
          location: place.vicinity,
          distance: 0,
          type: type,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          openNow: place.opening_hours ? place.opening_hours.open_now : true
        });

        this.calculateDistances(this.latlngUser);
      } else {
        for (let i = 0; i < results.length; i++) {
          let place = results[i];
          let type = '';

          if (place.name.toUpperCase().includes('IPIRANGA')) {
            type = 'Ipiranga';
          } else if (place.name.toUpperCase().includes('SHELL')) {
            type = 'Shell';
          } else if (place.name.toUpperCase().toUpperCase().includes('BR') || place.name.toUpperCase().includes('PETROBRAS')) {
            type = 'BR';
          } else {
            type = 'UNDEFINED';
          }

          this.gasStationsList.push({
            id: place.place_id,
            values: [
              { type: 'GC', label: 'Gasolina comum', value: '3,97' },
              { type: 'GA', label: 'Gasolina aditivada', value: '4,09' },
              { type: 'DI', label: 'Diesel', value: '3,36' },
              { type: 'ET', label: 'Etanol', value: '3,15' },
              { type: 'GNV', label: 'Gás natural veicular', value: '0,0' }
            ],
            name: place.name,
            distance: 0,
            location: place.vicinity,
            type: type,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            openNow: place.opening_hours ? place.opening_hours.open_now : true
          });

        }

        pagination.nextPage();

        this.gasStationsList = _.remove(this.gasStationsList, (g: any) => {
          return _.includes(g.name, 'Posto') && !_.includes(g.name, 'Borracharia' || 'Mecânica');
        });

        setTimeout(() => {
          this.calculateDistances(this.latlngUser);
        }, 1200);
      }
    }
  }

  getPlaceDetails(placeId: string) {
    let request = {
      placeId: placeId
    };

    this.service.getDetails(request, this.processDetails.bind(this));
  }

  processDetails(result, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      let gas = _.find(this.gasStationsList, (g) => {
        return g.id === result.place_id;
      });

      let index = this.gasStationsList.indexOf(gas);

      if (index > 0) {
        gas = _.assign(gas, { number: result.formatted_phone_number, address: result.address_components });
        this.gasStationsList.splice(index, 1, gas);
      }
    }
  }

  findAtLeastOne() {
    let params = {
      location: { lat: this.latlngUser.lat, lng: this.latlngUser.lng },
      radius: this.auxRaio,
      rankby: 'distance',
      type: 'gas_station',
      key: 'AIzaSyC4ac6cxMs7NqDfE7SWRqnJIlbg5PyhWcc'
    }

    this.service = new google.maps.places.PlacesService(this.map);
    this.service.textSearch(params, this.processResults.bind(this));
  }

  errorDetails(error: any) {
    let alert = this.alertCtrl.create({
      title: `Código: ${error.code}`,
      subTitle: error.message,
      buttons: [ 'Dismiss' ]
    });

    alert.present();
  }

  changeFuel() {
    if (this.typeCounter === 3) {
      this.typeCounter = 0;
    }
    this.typeCounter += 1;
    this.fuelType = this.types[this.typeCounter];
    console.log(this.fuelType);
  }

  orderBy(orderByAny?: string) {
    orderByAny ? this.orderByAny = orderByAny : this.orderByAny;
    this.gasStationsList = _.orderBy(this.gasStationsList, this.orderByAny, 'asc');
  }

  openMap() {
    this.navCtrl.push(HomePage, { gasStations: this.gasStationsList, backIsHide: true });
  }

}
