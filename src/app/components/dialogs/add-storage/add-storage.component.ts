import {Component, OnInit, ViewEncapsulation, Inject} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef, MatDialog, MAT_DIALOG_DATA} from '@angular/material';
import { appConfig } from '../../../models/config';
import { BytesPipe } from '../../../pipes/bytes.pipe';

@Component({
    selector: 'app-add-storage',
    templateUrl: './add-storage.component.html',
    styleUrls: ['./add-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddStorageComponent {

    private renterInfo: any = {};

    // Storage space to reserve with a click to reserve.
    private requestedAmountGb: number = null;
    private errorMessage = '';

    // The storage amount requested after multiplying by
    // the selected units. This is public in order to pass back
    // the amount to the parent component.
    public storageRequested: number = null;

    constructor(
        public dialogRef: MatDialogRef<AddStorageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.renterInfo = data.renterInfo;
    }

    reserveClicked() {
        if (!this.requestedAmountGb) {
            this.errorMessage = 'Must enter a storage amount';
            return;
        }
        if (!Number.isInteger(this.requestedAmountGb)) {
            this.errorMessage = 'Storage amount must be a whole number';
            return;
        }
        const requestedAmountBytes = this.requestedAmountGb * 1e9;
        const minAmount = appConfig['minStorageReservationAmount'];
        const maxAmount = appConfig['maxStorageReservationAmount'];
        if (requestedAmountBytes < minAmount) {
            this.errorMessage = `Must reserve at least ${new BytesPipe().transform(minAmount)}`;
            return;
        }
        if (requestedAmountBytes > maxAmount) {
            this.errorMessage = `Must reserve no more than ${new BytesPipe().transform(maxAmount)}`;
            return;
        }
        this.storageRequested = requestedAmountBytes;
        this.dialogRef.close();
   }

}
