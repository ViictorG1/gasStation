import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, NavParams, Nav, ModalController, LoadingController, AlertController } from 'ionic-angular';
import * as _ from 'lodash';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { FilterPage, HomePage } from '../index';

declare var google;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage implements AfterViewInit {

  @ViewChild(Nav) nav: Nav;

  calcDistanceMsg = 'Buscando postos';

  gasStations: any = [];
  gasStationsList: any[] = [];
  gasStation: any;

  map: any;
  latlngUser: LatLng;
  raio = 1000;
  auxRaio = 500;
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
  typeCounter = 1;
  fuelType: any = { type: 'GC', label: 'Gasolina comum', number: 0 };

  constructor(
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.presentLoadingDefault();
  }

  ngAfterViewInit() {
    this.getCurrentLocation();
  }

  doRefresh(refresher?) {
    this.gasStationsList = [];
    this.latlngUser = undefined;
    this.isReloading = true;
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
      let alert = this.alertCtrl.create({
        title: 'Erro!',
        subTitle: `Ocorreu um erro ao tentar buscar a sua localização. Código: ${error.code} | ${error.message}`,
        buttons: [
          { text: 'Tente novamente', handler: data => { this.getCurrentLocation() },},
          { text: 'Continuar sem localização'}
        ]
      });

      alert.present();
    });
  }

  calculateDistances(latlngUser: any) {
    this.loadingRoute = true;

    this.gasStationsList.forEach((gasStation: any) => {
      this.directionsService.route({
        origin: latlngUser,
        destination: new LatLng(gasStation.latitude, gasStation.longitude),
        travelMode: 'DRIVING'
      }, (response, status) => {
        if (status == 'OK') {
          gasStation.distance = response.routes[0].legs[0].distance.value;
          this.getPlaceDetails(gasStation.id);
        } else {
          console.log(status);
        }

        if (this.gasStationsList.length === this.gasStationsList.indexOf(gasStation) + 1) {
          if (gasStation.distance) {
            // this.gasStationsList = _.uniqBy(this.gasStationsList, 'distance');
            if (this.auxRaio > 500) {
              this.auxRaio = 500;
              this.gasStationsList.length = 1;
            } else {
              this.orderBy();
            }

            this.loadingRoute = false;
          }
        }
      });
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
          id: place.id,
          values: [
            { type: 'GC', label: 'Gasolina comum', value: '3,977' },
            { type: 'GA', label: 'Gasolina aditivada', value: '4,099' },
            { type: 'DI', label: 'Diesel', value: '3,369' },
            { type: 'ET', label: 'Etanol', value: '3,159' },
            { type: 'GNV', label: 'Gás natural veicular', value: '0,0' }
          ],
          name: place.name,
          location: place.vicinity,
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
            id: place.id,
            values: [
              { type: 'GC', label: 'Gasolina comum', value: '3,97' },
              { type: 'GA', label: 'Gasolina aditivada', value: '4,09' },
              { type: 'DI', label: 'Diesel', value: '3,36' },
              { type: 'ET', label: 'Etanol', value: '3,15' },
              { type: 'GNV', label: 'Gás natural veicular', value: '0,0' }
            ],
            name: place.name,
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
      location: {lat: this.latlngUser.lat, lng: this.latlngUser.lng},
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

  applyFilter(data: any) {
    return _.filter(this.gasStationsList, (gas: any) => {
      return gas.type === data.type || gas.distance <= data.distance;
    });
  }

  openFilter() {
    let filterModal = this.modalCtrl.create(FilterPage);
    filterModal.onDidDismiss(data => {
      this.filter = data;
      this.doRefresh();
    });
    filterModal.present();
  }

  changeFuel() {
    if (this.typeCounter === 4) {
      this.typeCounter = 0;
    }
    this.fuelType = this.types[this.typeCounter++];
  }

  orderBy(orderByAny?: string) {
    orderByAny ? this.orderByAny = orderByAny : this.orderByAny;
    this.gasStationsList = _.orderBy(this.gasStationsList, this.orderByAny, 'asc');
  }

  openMap() {
    this.navCtrl.push(HomePage, { gasStations: this.gasStationsList, backIsHide: true });
  }

}
