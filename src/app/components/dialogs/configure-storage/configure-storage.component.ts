import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material';
import { appConfig } from '../../../models/config';

@Component({
  selector: 'app-configure-storage',
  templateUrl: './configure-storage.component.html',
  styleUrls: ['./configure-storage.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigureStorageComponent implements OnInit {
    // Renter info object returned from the renter service.
    private renterInfo: any = {};

    private settings: any = {
        redundancy: 3,
        minContractDuration: 300000,
        maxContractDuration: 300000,
        maxPricePerGbPerMonth: 30,
    };

    // Storage space to reserve with a click to reserve.
    private storageAmount: number = null;

    constructor(private http: HttpClient,
                public dialogRef: MatDialogRef<ConfigureStorageComponent>) {
        this.updateRenterInfo();
    }

    ngOnInit() {
        this.updateRenterInfo();
    }

    updateRenterInfo() {
        this.http.get(`${appConfig['renterAddress']}/info`)
            .subscribe((resp: any) => {
                this.renterInfo = resp;
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
    }

    updateRenterSettings() {
        this.dialogRef.close();
    }

}
