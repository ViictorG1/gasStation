import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, NavParams, Nav, ModalController, LoadingController, AlertController } from 'ionic-angular';
import * as _ from 'lodash';

import { FirebaseService } from '../firebase.service';

import { HomePage } from '../home/home';
import { FilterPage } from '../filter/filter';

import { LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage implements AfterViewInit {
  @ViewChild(Nav) nav: Nav;

  map: any;
  service: any;
  gasStations: any = [];
  gasStationsList: any[] = [];
  loading: any;
  gasStation: any;
  latlngUser: LatLng;
  raio: number = 800;
  isReloading = false;
  loadingRoute = false; 
  directionsService = new google.maps.DirectionsService;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    private firebaseService: FirebaseService,
  ) {
    this.presentLoadingDefault();
  }

  ngAfterViewInit() {
    this.getCurrentLocation();
  }

  doRefresh(refresher) {
    this.gasStationsList = [];
    this.latlngUser = undefined;
    this.isReloading = true;
    this.getCurrentLocation();

    setTimeout(() => {
      this.isReloading = false;
      refresher.complete();
    }, 2000);
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

  openMap() {
    this.navCtrl.push(HomePage, {gasStations: this.gasStationsList, backIsHide: true});
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
            this.gasStationsList = _.uniqBy(this.gasStationsList, 'distance');
            this.gasStationsList = _.orderBy(this.gasStationsList, 'distance', 'asc'); 
            this.loadingRoute = false;           
          }
        }
      });
    });
    this.loading.dismiss();    
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      content: 'Carregando postos'
    });

    this.loading.present();
  }

  nearbyGasStations() {
    this.map = new google.maps.Map(document.getElementById('map'));

    let params = {
      location: {lat: this.latlngUser.lat, lng: this.latlngUser.lng},
      radius: this.raio,
      rankby: 'distance',
      query: 'Postos de Gasolina Florianópolis',
      type: 'gas_station',
      key: 'AIzaSyC4ac6cxMs7NqDfE7SWRqnJIlbg5PyhWcc'
    }

    this.service = new google.maps.places.PlacesService(this.map);
    this.service.textSearch(params, this.processResults.bind(this));
  }

  processResults(results, status, pagination) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      return;
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
          name: place.name,
          location: place.formatted_address,
          type: type,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        });

        this.firebaseService.postGasStations(place);
      }
      pagination.nextPage();
    }

    this.gasStationsList = _.remove(this.gasStationsList, (g: any) => {
      return _.includes(g.name, 'Posto') && !_.includes(g.name, 'Borracharia' || 'Mecânica');
    });

    setTimeout(() => {
      this.calculateDistances(this.latlngUser);
    }, 1500);
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

  openFilter() {
    let filterModal = this.modalCtrl.create(FilterPage);
    filterModal.present();
  }

  errorDetails(error: any) {
    let alert = this.alertCtrl.create({
      title: `Código: ${error.code}`,
      subTitle: error.message,
      buttons: [ 'Dismiss'
      ]
    });

    alert.present();
  }

}
