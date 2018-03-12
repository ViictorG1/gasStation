// ANGULAR
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { RatingComponent } from '../pages/index';

// IONIC
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

// NATIVE
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push } from '@ionic-native/push';
import { Device } from '@ionic-native/device';
import { HeaderColor } from '@ionic-native/header-color';
import { StatusBar } from '@ionic-native/status-bar';

// PIPE
import { TransformDistancePipe, GasStationPage, ListPage, HomePage, IntroPage } from '../pages/index';

// COMPONENT
import { GasStationApp } from './app.component';

@NgModule({
  declarations: [
    GasStationApp,
    HomePage,
    ListPage,
    GasStationPage,
    TransformDistancePipe,
    RatingComponent,
    IntroPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(GasStationApp),
    IonicModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    GasStationApp,
    HomePage,
    ListPage,
    GasStationPage,
    IntroPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Push,
    Device,
    HeaderColor,
    GoogleMaps,
    LaunchNavigator,
    Geolocation,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
