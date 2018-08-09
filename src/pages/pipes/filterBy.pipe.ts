import { Pipe } from '@angular/core';

@Pipe({
  name: 'filterBy'
})
export class FilterPipe {
  transform(value: any[], arg1: string, arg2: string) : any {
    let fieldName = arg1;
    let fieldValue = arg2;
    return value.find((e) => {
      return (e[fieldName] == fieldValue);
    });
  }
}