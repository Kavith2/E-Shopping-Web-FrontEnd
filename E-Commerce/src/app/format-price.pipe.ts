import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPrice'
})
export class FormatPricePipe implements PipeTransform {

  transform(value: number): string {
    const numStr = value.toString();

    if(numStr.length <=4){
      return numStr
    }
    else {
       return value.toLocaleString('en-US');
    }


    }
  }


