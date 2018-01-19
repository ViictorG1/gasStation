import {Pipe, PipeTransform} from '@angular/core';

@Pipe({ name: 'transformDistance' })
export class TransformDistancePipe implements PipeTransform {

  transform(distance: any) {
    if (distance) {
      if (distance >= 1000) {
        distance = distance / 1000;
        return `${distance.toFixed(1)}km`;
      } else {
        return `${distance}m`;
      }
    }
  }

}
