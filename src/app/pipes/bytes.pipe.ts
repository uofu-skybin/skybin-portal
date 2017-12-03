import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bytes' })
export class BytesPipe implements PipeTransform {

    transform(value: number) {
        if (value === undefined || value === null) {
            return '';
        }

        let amt = value;
        let suffix = 'B';

        if (value >= 1e9) {
            amt = value / 1e9;
            suffix = 'GB';
        } else if (value >= 1e6) {
            amt = value / 1e6;
            suffix = 'MB';
        } else if (value >= 1e3) {
            amt = value / 1e3;
            suffix = 'KB';
        }

        if (amt % 1 !== 0) {
            amt = parseFloat(amt.toFixed(1));
        }

        return amt + suffix;
    }
}
