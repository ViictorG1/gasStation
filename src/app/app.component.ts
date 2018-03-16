import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Device } from '@ionic-native/device';
import { HeaderColor } from '@ionic-native/header-color';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { AuthenticationService } from './shared/services/authentication.service' ;
import { UserService } from './shared/services/user.service';

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
    private headerColor: HeaderColor,
    private authenticationService: AuthenticationService,
    private userService: UserService
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Ínicio', component: HomePage },
      { title: 'Lista', component: ListPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      const options: PushOptions = {
        android: { senderID: this.device.uuid },
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
      let pushToken = '';

      pushObject.on('registration').subscribe((registration: any) => {
        pushToken = registration.registrationId;

        let youralert = this.alertCtrl.create({
          title: 'New Push notification',
          message: pushToken
        });
        youralert.present();
      });

      this.headerColor.tint('#4B84FB');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      let device = {
        model: this.device.model,
        spec: JSON.stringify({ platform: this.device.platform, uuid: this.device.uuid, version: this.device.cordova })
      }

      let serialized = localStorage.getItem('br.com.gasin');
      let context = serialized ? JSON.parse(serialized) : undefined;

      if (context) {
        // IF HAVE A CONTEXT IN STORE
        // this.authenticationService
        // .login(context.user.data.email, context.password)
        // .subscribe(() => {
        //   let serialized = localStorage.getItem('br.com.gasin');
        //   let ctxt = serialized ? JSON.parse(serialized) : undefined;
          // this.authenticationService.getDevice(1, ctxt)
          //   .subscribe((response: boolean) => {
          //     // DEVICE FOUND
          //   }, (error: Error) => {
          //     // ERROR DEVICE
          //   });
        // }, (error: any) => {
        //   console.warn(error);
        // });
      } else {
        let password = this.generateRandomHash();

        this.userService
        .createUser({ nickname: 'anonymous', email: `${this.generateRandomHash()}@gasin.com.br`, password: password })
        .subscribe((user: any) => {
          this.authenticationService
            .login(user.email, user.password)
            .subscribe((context: any) => {
              let serialized = localStorage.getItem('br.com.gasin');
              let ctxt = serialized ? JSON.parse(serialized) : undefined;

              this.authenticationService.createDevice(device, pushToken, ctxt)
                .subscribe((response: boolean) => {
                  // DEVICE CREATED
                }, (error: Error) => {
                  // ERROR DEVICE
                });
            }, (error: any) => {
              console.warn(error);
            });
        }, (error: any) => {
          console.warn(error);
        });
      }

      // pushObject.on('error').subscribe((error) => {
      //   let youralert = this.alertCtrl.create({
      //     title: 'New Push notification',
      //     message: error.message
      //   });
      //   youralert.present();
      // });

      pushObject.on('notification').subscribe((notification: any) => {
        let youralert = this.alertCtrl.create({
          title: 'New Push notification',
          message: notification.message
        });
        youralert.present();
      });
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  generateRandomHash(): string {
    return Math.random().toString(36).substring(3);
  }
}
