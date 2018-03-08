import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Device } from '@ionic-native/device';
import { HeaderColor } from '@ionic-native/header-color';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

@Component({
  templateUrl: 'app.html'
})
export class GasStationApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = ListPage;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    private push: Push,
    private device: Device,
    private headerColor: HeaderColor
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Ínicio', component: HomePage },
      { title: 'Lista', component: ListPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.headerColor.tint('#4B84FB');
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      console.log(this.device.uuid);
      const options: PushOptions = {
        android: { senderID: '256624249194' },
        ios: {
            alert: 'true',
            badge: true,
            sound: 'false'
        },
        browser: {
          pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        }
      };

      const pushObject: PushObject = this.push.init(options);

      // pushObject.on('registration').subscribe((registration: any) => {
      //   let pushToken = registration.registrationId;

      //   let youralert = this.alertCtrl.create({
      //     title: 'New Push notification',
      //     message: pushToken
      //   });
      //   youralert.present();
      // });

      // pushObject.on('error').subscribe((error) => {
      //   let youralert = this.alertCtrl.create({
      //     title: 'New Push notification',
      //     message: error.message
      //   });
      //   youralert.present();
      // });

      // pushObject.on('notification').subscribe((notification: any) => {
      //   let youralert = this.alertCtrl.create({
      //     title: 'New Push notification',
      //     message: notification.message
      //   });
      //   youralert.present();
      // });
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
