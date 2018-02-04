import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material';
import { appConfig } from '../../../models/config';

@Component({
    selector: 'app-add-storage',
    templateUrl: './add-storage.component.html',
    styleUrls: ['./add-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddStorageComponent implements OnInit {

    // Renter info object returned from the renter service.
    private renterInfo: any = {};

    private settings: any = {
        redundancy: 3,
        minContractDuration: 300000,
        maxContractDuration: 300000,
        maxPricePerGbPerMonth: 30,
    };

    // Storage space to reserve with a click to reserve.
    storageAmount: number = null;

    constructor(private http: HttpClient,
                public dialogRef: MatDialogRef<AddStorageComponent>) {
        this.updateRenterInfo();
    }

    ngOnInit() {
        this.updateRenterInfo();
    }

    reserveClicked() {
        if (!this.storageAmount || this.storageAmount <= 0) {
            return;
        }
        const params = {
            amount: this.storageAmount
        };
        this.http.post(`${appConfig['renterAddress']}/reserve-storage`, params)
            .subscribe((resp: any) => {
                this.updateRenterInfo();
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
        this.storageAmount = 0;
        this.dialogRef.close();
    }

    updateRenterInfo() {
        this.http.get(`${appConfig['renterAddress']}/info`)
            .subscribe((resp: any) => {
                this.renterInfo = resp;
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
    }

}
