import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html'
})
export class FilterPage {

  filter: any = {
    gasType: '',
    distance: 1,
  };
  selectOptions: any = {
    interface: 'popover'
  }

  constructor(
    public viewCtrl: ViewController
  ) {
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  filterList() {
    console.log(this.filter);
  }

}
