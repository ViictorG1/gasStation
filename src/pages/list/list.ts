import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, Nav, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';
import * as _ from 'lodash';

import { ContextService } from '../../app/shared/services/context.service';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { HomePage } from '../index';

import { IntroPage } from '../../pages/intro/intro';
import { PlaceService } from '../../app/shared/services/place.service';
import { InteractionService } from '../../app/shared/services/interaction.service';

declare var google;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  @ViewChild(Nav) nav: Nav;

  calcDistanceMsg = 'Buscando postos';

  gasStations: any = [];
  gasStationsList: any[] = [];
  gasStationsObservable: BehaviorSubject<any[]>;
  gasStation: any;
  places: any[] = [];
  placeIds: any[] = [];

  context: any;

  map: any;
  latlngUser: LatLng;
  raio = 2000;
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
    { type: 'GC', label: 'Gasolina Comum', number: 0 },
    { type: 'GA', label: 'Gasolina Aditivada', number: 1 },
    { type: 'DI', label: 'Diesel', number: 2 },
    { type: 'ET', label: 'Etanol', number: 3 },
    { type: 'GNV', label: 'Gás Natural Veicular', number: 4 }
  ];
  typeCounter = 0;
  fuelType: any;

  constructor(
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    private cd: ChangeDetectorRef,
    private contextService: ContextService,
    private placeService: PlaceService,
    private interactionService: InteractionService
  ) {
    this.gasStationsObservable = <BehaviorSubject<any[]>>new BehaviorSubject([]);
    this.fuelType = { type: 'GC', label: 'Gasolina comum', number: 0 };
  }

  ionViewDidLoad() {
    this.storage.get('intro-done').then(done => {
      if (!done) {
        this.storage.set('intro-done', true);
        this.navCtrl.setRoot(IntroPage);
      } else {
        this.contextService.contextChanges$.subscribe((context: any) => {
          if (context) {
            if (context.isLoggedIn) {
              this.context = context;
              this.presentLoadingDefault();
              this.getCurrentLocation();
            }
          }
        });
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

    this.interactionService.createInteraction({ interaction_type_id: '100', place_id: this.gasStation.id, description: 'List page' }, this.context)
      .subscribe((data: any) => {
      }, (error: Error) => {
        console.warn(error);
      });

    this.navCtrl.push(HomePage, {
      gasStation: gasStation,
      backIsHide: true,
      gasStations: this.gasStationsList,
      userLocation: this.latlngUser,
      context: this.context
    });
  }

  getCurrentLocation() {
    console.log('getCurrentLocation')
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

    const params = {
      location: { lat: this.latlngUser.lat, lng: this.latlngUser.lng },
      radius: this.raio,
      rankby: 'distance',
      type: 'gas_station',
      key: 'AIzaSyC4ac6cxMs7NqDfE7SWRqnJIlbg5PyhWcc'
    }
    this.service = new google.maps.places.PlacesService(this.map);
    this.service.nearbySearch(params, this.processResults.bind(this), );
  }

  processResults(results, status) {
    if (status !== "OK") {
      this.auxRaio = this.auxRaio + 500;

      setTimeout(() => {
        this.findAtLeastOne();
      }, 1000);
      return;
    } else {
      Observable.from(results)
        .forEach((result: any) => {
          this.placeIds.push(result.place_id);
        })
        .then(() => {
          this.placeService.getPlaces(this.context, this.placeIds)
          .subscribe((places: any[]) => {
            for (let i = 0; i < results.length; i++) {
              let place = results[i];
              let foundedPlace: any = _.find(places, { google_place_id: place.place_id });

              if (foundedPlace) {
                if (foundedPlace.is_visible) {
                  this.calculateDistance(place, this.latlngUser, foundedPlace);
                }
              } else {
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

                const createPlace = {
                  name: place.name,
                  google_place_id: place.place_id,
                  is_visible: true,
                  settings: '',
                  flag: type || 'UNDEFINED'
                }

                this.placeService.createPlace(createPlace, this.context)
                  .subscribe((newPlace: any) => {
                    let interaction = {
                      device_id: this.context.deviceId,
                      interaction_type_id: "801",
                      place_id: newPlace.id,
                      description: [
                        { short: 'GC', label: 'Gasolina comum', amount: 1000 },
                        { short: 'GA', label: 'Gasolina aditivada', amount: 1000 },
                        { short: 'DI', label: 'Diesel', amount: 1000 },
                        { short: 'ET', label: 'Etanol', amount: 1000 },
                        { short: 'GNV', label: 'Gás natural veicular', amount: 1000 }
                      ]
                    }
                    this.interactionService.createInteraction(interaction, this.context)
                      .subscribe((data: any) => {
                      }, (error: Error) => {
                        console.warn(error);
                      });
                      this.calculateDistance(place, this.latlngUser, newPlace);
                  }, (error: Error) => {
                    console.warn(error);
                  });

                this.cd.detectChanges();
              }
            }

            this.cd.markForCheck();
            this.loading.dismiss();
          }, (error: any) => {
            console.warn(error);
          });
        });
    }
  }

  calculateDistance(place: any, latlngUser: any, foundedPlace: any) {
    this.directionsService.route({
      origin: latlngUser,
      destination: new LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        this.marshalGasStations(_.assign(place, { distance: response.routes[0].legs[0].distance.value}), foundedPlace);
      }
      this.cd.detectChanges();
    });
  }

  getPlaceDetails(placeId: string) {
    let request = {
      placeId: placeId
    };

    this.service.getDetails(request, this.processDetails.bind(this));
  }

  processDetails(result, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      let gas = _.find(this.gasStationsList, (g: any) => {
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
    this.service.nearbySearch(params, this.processResults.bind(this));
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
    if (this.typeCounter === 4) {
      this.typeCounter = 0;
    } else {
      this.typeCounter += 1;
    }
    this.fuelType = this.types[this.typeCounter];
  }

  marshalGasStations(place: any, foundedPlace: any) {
    let flag = '';

    if (place.name.toUpperCase().includes('IPIRANGA')) {
      flag = 'Ipiranga';
    } else if (place.name.toUpperCase().includes('SHELL')) {
      flag = 'Shell';
    } else if (place.name.toUpperCase().toUpperCase().includes('BR') || place.name.toUpperCase().includes('PETROBRAS')) {
      flag = 'BR';
    } else {
      flag = 'UNDEFINED';
    }

    this.gasStationsList.push({
      id: foundedPlace.id,
      place_id: foundedPlace.google_place_id,
      values: foundedPlace.values || [
        { type: 'GC', updatedAt: foundedPlace.updated_at, label: 'Gasolina comum', value: foundedPlace.prices ? foundedPlace.prices.find(x => x.short === 'GC').amount / 1000 : 1.000 },
        { type: 'GA', updatedAt: foundedPlace.updated_at, label: 'Gasolina aditivada', value: foundedPlace.prices ? foundedPlace.prices.find(x => x.short === 'GA').amount / 1000 : 1.000 },
        { type: 'DI', updatedAt: foundedPlace.updated_at, label: 'Diesel', value: foundedPlace.prices ? foundedPlace.prices.find(x => x.short === 'DI').amount / 1000 : 1.000 },
        { type: 'ET', updatedAt: foundedPlace.updated_at, label: 'Etanol', value: foundedPlace.prices ? foundedPlace.prices.find(x => x.short === 'ET').amount / 1000 : 1.000 },
        { type: 'GNV', updatedAt: foundedPlace.updated_at, label: 'Gás natural veicular', value: foundedPlace.prices ? foundedPlace.prices.find(x => x.short === 'GNV').amount / 1000 : 1.000 }
      ],
      name: foundedPlace.name || place.name,
      location: place.vicinity,
      distance: place.distance,
      flag: foundedPlace.flag || flag,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      openNow: place.opening_hours ? place.opening_hours.open_now : true
    });

    this.orderBy('distance');
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  orderBy(orderByAny?: string) {
    orderByAny ? this.orderByAny = orderByAny : this.orderByAny;
    this.gasStationsList = _.orderBy(this.gasStationsList, this.orderByAny, 'asc');
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  openMap() {
    this.navCtrl.push(HomePage, { gasStations: this.gasStationsList, backIsHide: true, context: this.context });
  }

}
