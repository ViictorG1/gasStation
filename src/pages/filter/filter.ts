import { Component, Output, EventEmitter } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html'
})
export class FilterPage {

  @Output() dataFilter: EventEmitter<number> = new EventEmitter<number>();

  filter: any = {
    gasType: '',
    distance: 1,
    rating: 1
  };
  selectOptions: any = {
    interface: 'popover'
  }

  constructor(
    public viewCtrl: ViewController
  ) {
  }

  dismiss(data) {
    data ? this.viewCtrl.dismiss(data) : this.viewCtrl.dismiss();
  }

  filterList() {
    this.filter.distance = this.filter.distance * 1000;
    this.dismiss(this.filter);
  }

  onRatingChange(rating: any) {
    this.filter.rating = rating;
  }

}
