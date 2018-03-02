// ANGULAR
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { RatingComponent } from '../pages/index';

// IONIC
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

// FIREBASE
import { AngularFireModule } from 'angularfire2';
import { FirebaseService } from '../pages/firebase.service';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDiH2tM2VkKoZWgAhI89y2ixvOKr908nsw",
  authDomain: "gasstation-981b8.firebaseapp.com",
  databaseURL: "https://gasstation-981b8.firebaseio.com",
  storageBucket: "gasstation-981b8.appspot.com",
  messagingSenderId: "256624249194"
};

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
import { TransformDistancePipe, FilterPage, ChooseTypePage, GasStationPage, ListPage, HomePage } from '../pages/index';

// COMPONENT
import { GasStationApp } from './app.component';

@NgModule({
  declarations: [
    GasStationApp,
    HomePage,
    ListPage,
    GasStationPage,
    FilterPage,
    ChooseTypePage,
    TransformDistancePipe,
    RatingComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(GasStationApp),
    IonicModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    GasStationApp,
    HomePage,
    ListPage,
    GasStationPage,
    FilterPage,
    ChooseTypePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Push,
    Device,
    HeaderColor,
    GoogleMaps,
    LaunchNavigator,
    FirebaseService,
    Geolocation,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
