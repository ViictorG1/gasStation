TO RUN ON ANDROID 

```bash
$ ionic cordova run android --device
```

sudo apt-get install openjdk-8-jdk
cd android-sdk-linux/tools
./android update sdk --no-ui
export PATH=${PATH}:$HOME/Android/Sdk/platform-tools:$HOME/Android/Sdk/tools:$HOME/Android/Sdk/build-tools/23.0.2/

/home/victor/Android/Sdk/tools/android sdk

./sdkmanager
./avdmanager
./avdmanager create avd

sudo mkdir /opt/gradle
sudo apt-get install wget unzip
wget https://services.gradle.org/distributions/gradle-3.4.1-bin.zip
sudo unzip -d /opt/gradle gradle-3.4.1-bin.zip
export PATH=$PATH:/opt/gradle/gradle-3.4.1/bin
export ANDROID_HOME=$HOME/victor sdk path

export PATH=$PATH:$ANDROID_HOME/tools

ionic cordova plugin add cordova-plugin-geolocation
npm install --save @ionic-native/geolocation


This is a starter template for [Ionic](http://ionicframework.com/docs/) projects.

## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start mySideMenu sidemenu
```

Then, to run it, cd into `mySideMenu` and run:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.

