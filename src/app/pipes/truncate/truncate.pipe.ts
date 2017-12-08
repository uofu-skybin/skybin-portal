import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

    transform(value: string, args?: any): any {
        if (value) {
            return value.substring(0, 10) + ' ... ';
        } else {
            return ' - ';
        }
    }
}
