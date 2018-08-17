import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {

  transform(dateIso8601: string, pattern: string): any {
    if (dateIso8601) {
      return moment(dateIso8601).format(pattern);
    }
    return '';
  }

}
