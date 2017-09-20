import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html'
})
export class FilterPage {

  constructor(
    public viewCtrl: ViewController
  ) {
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}
