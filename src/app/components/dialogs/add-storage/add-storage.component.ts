import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { appConfig } from '../../../models/config';
import { BytesPipe } from '../../../pipes/bytes.pipe';

// Possible UI states. The current state dictates what is shown in the dialog.
const SHOW_INPUTS = 'SHOW_INPUTS';
const SHOW_PROGRESS = 'SHOW_PROGRESS';
const SHOW_CONFIRMATION = 'SHOW_CONFIRMATION';
const SHOW_ERROR = 'SHOW_ERROR';

@Component({
    selector: 'app-add-storage',
    templateUrl: './add-storage.component.html',
    styleUrls: ['./add-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddStorageComponent {

    private renterInfo: any = {};
    private storageEstimate: any = {};

    // Storage space to reserve with a click to reserve.
    private requestedAmountGb: number = null;
    private errorMessage = '';
    private progressMessage = '';

    // The storage amount successfully reserved, in bytes.
    // This is public in order to pass back the amount to the parent component.
    public storageReserved: number = null;

    // Current view state.
    private state = SHOW_INPUTS;

    constructor(
        public dialogRef: MatDialogRef<AddStorageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpClient,
    ) {
        this.renterInfo = data.renterInfo;
    }

    findSpaceClicked() {
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
        const req = {
            amount: requestedAmountBytes,
        };
        this.showProgress('Finding storage providers');
        this.http.post(`${appConfig['renterAddress']}/create-storage-estimate`, req)
            .subscribe((response: any) => {
                this.storageEstimate = response;
                this.state = SHOW_CONFIRMATION;
                console.log('got storage estimate:');
                console.log(this.storageEstimate);
            }, (error: HttpErrorResponse) => {
                console.error('Error creating storage estimate');
                console.error(error);
                let errorMsg = 'Error finding providers.';
                if (error.error && error.error.error) {
                    errorMsg = error.error.error;
                }
                this.showError(errorMsg);
            });
    }

    confirmClicked() {
        this.showProgress('Confirming storage agreements');
        this.http.post(`${appConfig['renterAddress']}/confirm-storage-estimate`, this.storageEstimate)
            .subscribe((response: any) => {
                console.log('storage estimate confirmed');
                this.storageReserved = this.storageEstimate.totalSpace;
                this.dialogRef.close();
            }, (error: HttpErrorResponse) => {
                console.error('Error confirming storage estimate');
                console.error(error);
                let errorMsg = 'Error confirming storage agreements.';
                if (error.error && error.error.error) {
                    errorMsg = error.error.error;
                }
                this.showError(errorMsg);
            });
    }

    showError(error) {
        this.errorMessage = error;
        this.state = SHOW_ERROR;
    }

    showProgress(message) {
        this.progressMessage = message;
        this.state = SHOW_PROGRESS;
    }

    formatStorageCost(cost: number) {
        return '$' + (cost / 1000).toFixed(3);
    }

}
