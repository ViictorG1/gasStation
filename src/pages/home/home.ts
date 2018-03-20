import { NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Component, ViewChild, ElementRef } from '@angular/core';
import $ from 'jquery';

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
  service: any;
  place: any;
  userLocation: any;
  gasStationLocation: any;
  listPage = { title: 'List', component: ListPage };
  loading: any;
  gasStation: any;
  gasStations: any[] = [];
  filteredGasStations: any[] = [];
  backIsHide: boolean = false;
  searchButton: boolean = false;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  iconsIpiranga = {
    gasStation: new google.maps.MarkerImage(
      'assets/images/ipirangam.svg',
      new google.maps.Size( 20, 27 ),
      new google.maps.Point( 0, 0 ),
      new google.maps.Point( 10, 27 )
    )
  };
  iconsShell = {
    gasStation: new google.maps.MarkerImage(
      'assets/images/shellm.svg',
      new google.maps.Size( 20, 27 ),
      new google.maps.Point( 0, 0 ),
      new google.maps.Point( 10, 27 )
    )
  };
  iconsBr = {
    gasStation: new google.maps.MarkerImage(
      'assets/images/brm.svg',
      new google.maps.Size( 20, 27 ),
      new google.maps.Point( 0, 0 ),
      new google.maps.Point( 10, 27 )
    )
  };
  iconsUndefined = {
    gasStation: new google.maps.MarkerImage(
      'assets/images/undefinedm.svg',
      new google.maps.Size( 20, 27 ),
      new google.maps.Point( 0, 0 ),
      new google.maps.Point( 10, 27 )
    )
  };
  iconsUser = {
    gasStation: new google.maps.MarkerImage(
      'assets/images/user.svg',
      new google.maps.Size( 30, 30 ),
      new google.maps.Point( 0, 0 ),
      new google.maps.Point( 15, 15 )
    )
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
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

  initSearchComponent() {
    const options = {
      componentRestrictions: {country: "bra"}
    };

    let input = document.getElementById('pac-input');
    let searchBox = new google.maps.places.Autocomplete(input, options);
    searchBox.setTypes(['geocode']);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    this.map.addListener('bounds_changed', (a: any) => {
      searchBox.setBounds(this.map.getBounds());
    });
    searchBox.addListener('place_changed', (a: any) => {
      let place = searchBox.getPlace();
      this.place = place;
      this.nearbyGasStations();
      this.searchGasStations(place);
      $('#pac-input').val('');
    });
  }

  loadListVariables() {
    this.gasStation = this.navParams.get('gasStation') || undefined;
    this.backIsHide = this.navParams.get('backIsHide') || false;
    this.gasStations = this.navParams.get('gasStations') || [];
  }

  loadAllGasStations() {
    if (this.gasStations) {
      this.gasStations.forEach((gasStation: any) => {
        switch (gasStation.type) {
          case 'Ipiranga':
          this.makeMarker(
            new LatLng(parseFloat(gasStation.latitude),
            parseFloat(gasStation.longitude)),
            this.iconsIpiranga.gasStation,
            gasStation);
          break;

          case 'Shell':
          this.makeMarker(
            new LatLng(parseFloat(gasStation.latitude),
            parseFloat(gasStation.longitude)),
            this.iconsShell.gasStation,
            gasStation);
          break;

          case 'BR':
          this.makeMarker(
            new LatLng(parseFloat(gasStation.latitude),
            parseFloat(gasStation.longitude)),
            this.iconsBr.gasStation,
            gasStation);
          break;

          case 'UNDEFINED':
          this.makeMarker(
            new LatLng(parseFloat(gasStation.latitude),
            parseFloat(gasStation.longitude)),
            this.iconsUndefined.gasStation,
            gasStation);
          break;
        }
      });
    }
  }

  nearbyGasStations() {
    this.gasStations = [];

    let params = {
      location: { lat: this.place.geometry.location.lat(), lng: this.place.geometry.location.lng() },
      radius: 1500,
      rankby: 'distance',
      type: 'gas_station',
      key: 'AIzaSyC4ac6cxMs7NqDfE7SWRqnJIlbg5PyhWcc'
    }

    this.service = new google.maps.places.PlacesService(this.map);
    this.service.nearbySearch(params, this.processResults.bind(this));
  }

  processResults(results, status, pagination) {
    if (status === "OK") {
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

        this.gasStations.push({
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

        if (i === results.length -1) {
          this.gasStations.forEach((gasStation: any) => {
            switch (gasStation.type) {
              case 'Ipiranga':
              this.makeMarker(
                new LatLng(parseFloat(gasStation.latitude),
                parseFloat(gasStation.longitude)),
                this.iconsIpiranga.gasStation,
                gasStation);
              break;

              case 'Shell':
              this.makeMarker(
                new LatLng(parseFloat(gasStation.latitude),
                parseFloat(gasStation.longitude)),
                this.iconsShell.gasStation,
                gasStation);
              break;

              case 'BR':
              this.makeMarker(
                new LatLng(parseFloat(gasStation.latitude),
                parseFloat(gasStation.longitude)),
                this.iconsBr.gasStation,
                gasStation);
              break;

              case 'UNDEFINED':
              this.makeMarker(
                new LatLng(parseFloat(gasStation.latitude),
                parseFloat(gasStation.longitude)),
                this.iconsUndefined.gasStation,
                gasStation);
              break;
            }
          });
        }
      }

      pagination.nextPage();
    }
  }

  loadMap() {
    this.loadListVariables();

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 10,
      center: this.userLocation,
      scrollwheel: false,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false
    });

    this.makeMarker(
      this.userLocation,
      this.iconsUser.gasStation
    );

    this.loading.dismiss();

    this.initSearchComponent();


    if (this.gasStation) {
      this.loadAllGasStations();
      this.addInfoWindow(this.gasStation);
      this.gasStationLocation = new LatLng(parseFloat(this.gasStation.latitude), parseFloat(this.gasStation.longitude));
      this.map.setZoom(17);
      this.map.panTo(this.gasStationLocation);
    } else {
      let bounds = new google.maps.LatLngBounds();
      for (let i = 0; i < this.gasStations.length; i++) {
        bounds.extend(new LatLng(this.gasStations[i].latitude, this.gasStations[i].longitude));
      }

      this.map.fitBounds(bounds);
      this.map.setZoom(15);
      this.loadAllGasStations();
    }
  }

  addInfoWindow(gasStation: any) {
    let gasStationModal = this.modalCtrl.create(GasStationPage, {
      gasStation: gasStation,
      latlngUser: this.userLocation
    });
    gasStationModal.present();
  }

  makeMarker(position, icon, gasStation?) {
    let marker;

    if (gasStation) {
      marker = new google.maps.Marker({
        position: position,
        map: this.map,
        icon: icon,
        title: gasStation.name
      });

      google.maps.event.addListener(marker, 'click', () => {
        this.addInfoWindow(gasStation);
      });
    } else {
      marker = new google.maps.Marker({
        position: position,
        map: this.map,
        icon: icon,
        title: 'Você'
      });
    }
  }

  getMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.userLocation = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.loadMap();
    }).catch((error) => {
      let alert = this.alertCtrl.create({
        title: 'Erro!',
        subTitle: 'Ocorreu um erro ao tentar buscar a sua localização.',
        buttons: [
          { text: 'Tente novamente', handler: data => { this.presentLoadingDefault();},},
          { text: 'Continuar sem localização'}
        ]
      });

      alert.present();
    });
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      content: 'Carregando mapa'
    });

    this.loading.present();
  }

  openSearchButton() {
    if (this.searchButton) {
      this.searchButton = false;
    } else {
      this.searchButton = true;
    }
  }

  searchGasStations(place: any) {
    let circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0,
      fillColor: '#FF0000',
      fillOpacity: 0,
      map: this.map,
      center: new LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
      radius: 1000
    });

    let bounds = circle.getBounds();

    this.map.fitBounds(bounds);
  }

  clearOverlays() {
    while(this.filteredGasStations.length) { this.filteredGasStations.pop().setMap(null); }
    this.filteredGasStations.length = 0;
  }
}