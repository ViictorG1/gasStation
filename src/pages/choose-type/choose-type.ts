import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-choose-type',
  templateUrl: 'choose-type.html'
})
export class ChooseTypePage {

  types = [
    { type: 'GC', label: 'Gasolina comum', number: 0 },
    { type: 'GA', label: 'Gasolina aditivada', number: 1 },
    { type: 'DI', label: 'Diesel', number: 2 },
    { type: 'ET', label: 'Etanol', number: 3 },
    { type: 'GNV', label: 'Gás natural veicular', number: 4 }
  ]

  constructor(
    public viewCtrl: ViewController
  ) {
  }

  dismiss(data) {
    data ? this.viewCtrl.dismiss(data) : this.viewCtrl.dismiss();
  }

  chooseType(number) {
    this.dismiss(number);
  }

}
