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

    // Possible storage units the user can select from.
    private storageUnits = [
        'Megabytes',
        'Gigabytes',
    ];
    private selectedUnits = 'Gigabytes';

    // Storage space to reserve with a click to reserve.
    private storageAmount: number = null;
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
        if (!this.storageAmount) {
            this.errorMessage = 'Must enter a storage amount';
            return;
        }
        if (!Number.isInteger(this.storageAmount)) {
            this.errorMessage = 'Storage amount must be a whole number';
            return;
        }
        if (!this.selectedUnits) {
            this.errorMessage = 'Must select units';
            return;
        }
        const multipliers = {
            'Megabytes': 1e6,
            'Gigabytes': 1e9,
        };
        const multiplier = multipliers[this.selectedUnits];
        const requestedAmount = this.storageAmount * multiplier;
        const minAmount = appConfig['minStorageReservationAmount'];
        const maxAmount = appConfig['maxStorageReservationAmount'];
        if (requestedAmount < minAmount) {
            this.errorMessage = `Must reserve at least ${new BytesPipe().transform(minAmount)}`;
            return;
        }
        if (requestedAmount > maxAmount) {
            this.errorMessage = `Must reserve no more than ${new BytesPipe().transform(maxAmount)}`;
            return;
        }
        this.storageRequested = requestedAmount;
        this.dialogRef.close();
   }

}
