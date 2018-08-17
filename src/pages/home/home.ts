import { NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import $ from 'jquery';
import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';

import { PlaceService } from '../../app/shared/services/place.service';

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

  context: any;
  placeIds: string[] = [];

  input: HTMLElement;
  searchButton = false;

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
  backIsHide = false;

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
    public geolocation: Geolocation,
    private placeService: PlaceService,
    private cd: ChangeDetectorRef
  ) {
    this.presentLoadingDefault();
    this.getMap();
    this.searchButton = true;
  }

  loadMap() {
    this.loadListVariables();

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 10,
      center: this.userLocation,
      scrollwheel: false,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      mapTypeId: 'customstyle'
    });

    this.map.mapTypes.set('customstyle', new google.maps.StyledMapType(this.getStyle(), { name: 'Custom Style' }));

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
      this.map.setZoom(14);
      this.loadAllGasStations();
    }
  }

  openList() {
    this.navCtrl.popToRoot();
  }

  openSearchButton() {
    this.searchButton = !this.searchButton;
    if (this.searchButton) {
      this.input.setAttribute('style', 'visibility: visible');
    } else {
      this.input.setAttribute('style', 'visibility: hidden');
    }
  }

  initSearchComponent() {
    const options = {
      componentRestrictions: { country: "bra" }
    };

    this.input = document.getElementById('pac-input');
    const searchBox = new google.maps.places.Autocomplete(this.input, options);
    searchBox.setTypes(['geocode']);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.input);

    this.map.addListener('bounds_changed', (a: any) => {
      searchBox.setBounds(this.map.getBounds());
    });
    searchBox.addListener('place_changed', (a: any) => {
      const place = searchBox.getPlace();
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
    this.context = this.navParams.get('context') || {};
  }

  loadAllGasStations() {
    if (this.gasStations) {
      this.gasStations.forEach((gasStation: any) => {
        this.makeMarkers(gasStation);
      });
    }
  }

  nearbyGasStations() {
    this.gasStations = [];

    const params = {
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
      Observable.from(results)
        .forEach((result: any) => {
          this.placeIds.push(result.place_id);
        })
        .then(() => {
          this.placeService.getPlaces(this.context, this.placeIds)
          .subscribe((places: any[]) => {
            for (let i = 0; i < results.length; i++) {
              const place = results[i];
              const foundedPlace = _.find(places, { google_place_id: place.place_id });

              if (foundedPlace && foundedPlace.is_visible) {
                if (_.includes(place.name, 'Posto') && !_.includes(place.name, 'Borracharia' || 'Mecânica')) {
                  this.marshalGasStations(place, foundedPlace);
                }
              }

              this.loading.dismiss();
            }
          }, (error: any) => {
            console.warn(error);
          });
        });
      }

    pagination.nextPage();
  }

  private marshalGasStations(place: any, foundedPlace: any) {
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

    const gasStation = {
      id: foundedPlace.id,
      place_id: foundedPlace.google_place_id,
      values: foundedPlace.values || [
        { type: 'GC', label: 'Gasolina comum', value: foundedPlace.prices.length ? foundedPlace.prices.find(x => x.short === 'GC').amount / 1000 : 1.000 },
        { type: 'GA', label: 'Gasolina aditivada', value: foundedPlace.prices.length ? foundedPlace.prices.find(x => x.short === 'GA').amount / 1000 : 1.000 },
        { type: 'DI', label: 'Diesel', value: foundedPlace.prices.length ? foundedPlace.prices.find(x => x.short === 'DI').amount / 1000 : 1.000 },
        { type: 'ET', label: 'Etanol', value: foundedPlace.prices.length ? foundedPlace.prices.find(x => x.short === 'ET').amount / 1000 : 1.000 },
        { type: 'GNV', label: 'Gás natural veicular', value: foundedPlace.prices.length ? foundedPlace.prices.find(x => x.short === 'GNV').amount / 1000 : 1.000 }
      ],
      name: place.name,
      location: place.vicinity,
      distance: place.distance,
      flag: foundedPlace.flag || flag,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      openNow: place.opening_hours ? place.opening_hours.open_now : true
    };

    this.makeMarkers(gasStation);

    this.gasStations.push(gasStation);
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  private addInfoWindow(gasStation: any) {
    let gasStationModal = this.modalCtrl.create(GasStationPage, {
      gasStation: gasStation,
      latlngUser: this.userLocation,
      context: this.context
    });
    gasStationModal.present();
  }

  private makeMarker(position, icon, gasStation?) {
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

  private getMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.userLocation = new LatLng(resp.coords.latitude, resp.coords.longitude);
      this.loadMap();
    }).catch((error) => {
      let alert = this.alertCtrl.create({
        title: 'Erro!',
        subTitle: 'Ocorreu um erro ao tentar buscar a sua localização.',
        buttons: [
          { text: 'Tente novamente', handler: () => { this.presentLoadingDefault();},},
          { text: 'Continuar sem localização'}
        ]
      });

      alert.present();
    });
  }

  private presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      content: 'Carregando mapa'
    });

    this.loading.present();
  }

  private searchGasStations(place: any) {
    const circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0,
      fillColor: '#FF0000',
      fillOpacity: 0,
      map: this.map,
      center: new LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
      radius: 1000
    });

    this.map.fitBounds(circle.getBounds());
  }

  private makeMarkers(gasStation) {
    switch (gasStation.flag) {
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
  }

  private getStyle() {
    const date = new Date();
    if (date.getHours() > 6 || date.getHours() < 18) {
      return [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            {
              color: "#e9e9e9"
            },
            {
              lightness: 17
            }
          ]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [
            {
              color: "#f5f5f5"
            },
            {
              lightness: 20
            }
          ]
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [
            {
              saturation: "-100"
            }
          ]
        },
        {
          featureType: "road.highway",
          elementType: "all",
          stylers: [
            {
              lightness: "30"
            }
          ]
        },
        {
          featureType: "road.arterial",
          elementType: "all",
          stylers: [
            {
              lightness: "30"
            }
          ]
        },
        {
          featureType: "road.local",
          elementType: "all",
          stylers: [
            {
              lightness: "40"
            }
          ]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [
            {
              color: "#f5f5f5"
            },
            {
              lightness: 21
            }
          ]
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [
            {
              color: "#dedede"
            },
            {
              lightness: 21
            }
          ]
        },
        {
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#ffffff"
            },
            {
              lightness: 16
            }
          ]
        },
        {
          elementType: "labels.text.fill",
          stylers: [
            {
              saturation: 36
            },
            {
              color: "#333333"
            },
            {
              lightness: 40
            }
          ]
        },
        {
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [
            {
              color: "#f2f2f2"
            },
            {
              lightness: 19
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#fefefe"
            },
            {
              lightness: 20
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#fefefe"
            },
            {
              lightness: 17
            },
            {
              weight: 1.2
            }
          ]
        }
      ]
    } else {
      return [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [
            {
              saturation: 36
            },
            {
              color: "#000000"
            },
            {
              lightness: 40
            }
          ]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#000000"
            },
            {
              lightness: 16
            }
          ]
        },
        {
          featureType: "all",
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 20
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 17
            },
            {
              "weight": 1.2
            }
          ]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
              {
              lightness: 20
              }
          ]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 21
            }
          ]
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 17
            }
          ]
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 29
            },
            {
              "weight": 0.2
            }
          ]
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 18
            }
          ]
        },
        {
          featureType: "road.local",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 16
            }
          ]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 19
            }
          ]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 17
            }
          ]
        }
      ]
    }
  }
}