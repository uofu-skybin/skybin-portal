import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';
import { appConfig } from '../../../models/config';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
    selector: 'app-configure-provider',
    templateUrl: './configure-provider.component.html',
    styleUrls: ['./configure-provider.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ConfigureProviderComponent implements OnInit {
    private MIN_STORAGE_GB = 1;
    private MAX_STORAGE_GB = 10000;

    private providerConfig: any = {
        publicApiAddress: ':8003',
        localApiAddress: ':8004',
        spaceAvail: 9999999999,
        storageRate: 30,
        minStorageRate: 80,
        maxStorageRate: 200,
        pricingPolicy: 'passive',
    };

    // Fetched just to validate that the user doesn't
    // try to set the storage offered below what is
    // currently reserved by renters.
    private providerInfo: any = {
        storageReserved: 0,
    };

    // User inputs
    public storageAmountGb = 0;
    public publicApiIp = '';
    public publicApiPort = 8003;
    public minStorageRate = 80; // in $/GB/Month
    public storageRate = 0; // in $/GB/Month

    public errorMessage = '';

    constructor(private http: HttpClient,
        public dialogRef: MatDialogRef<ConfigureProviderComponent>) {
    }

    ngOnInit() {
        this.fetchProviderConfig();
        this.fetchProviderInfo();
    }

    fetchProviderConfig() {
        this.http.get(`${appConfig['providerAddress']}/config`)
            .subscribe((response: any) => {
                this.providerConfig = response;
                const addr = response.publicApiAddress.split(':');
                this.publicApiIp = addr[0];
                this.publicApiPort = addr[1];
                this.storageAmountGb = this.providerConfig.spaceAvail / 1e9;
                this.minStorageRate = this.providerConfig.minStorageRate / 1000;
                this.storageRate = this.providerConfig.storageRate / 1000;
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider configuration.');
                console.error('Error:', error);
            });
    }

    fetchProviderInfo() {
        this.http.get(`${appConfig['providerAddress']}/info`)
            .subscribe((response: any) => {
                this.providerInfo = response;
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider info.');
                console.error('Error:', error);
            });
    }

    updateSettingsClicked() {
        this.errorMessage = '';
        if (this.storageAmountGb < this.MIN_STORAGE_GB ||
            this.storageAmountGb > this.MAX_STORAGE_GB) {
            this.errorMessage = `You should provide between ${this.MIN_STORAGE_GB} and ${this.MAX_STORAGE_GB} gigabytes of space`;
            return;
        }
        if (this.publicApiPort < 1024 || this.publicApiPort > 65535) {
            this.errorMessage = 'Port must be in the range 1024-65535';
            return;
        }
        if (this.minStorageRate < 0) {
            this.errorMessage = 'Min Storage Rate must be positive';
            return;
        }
        if (this.storageAmountGb * 1e9 < this.providerInfo.storageReserved) {
            this.errorMessage = 'Storage Offered must be more than what is already reserved by renters.';
            return;
        }

        this.providerConfig.publicApiAddress = this.publicApiIp + ':' + this.publicApiPort;
        this.providerConfig.spaceAvail = this.storageAmountGb * 1e9;
        this.providerConfig.minStorageRate = this.minStorageRate * 1000;
        this.providerConfig.storageRate = this.storageRate * 1000;

        if (this.providerConfig.storageRate < this.providerConfig.minStorageRate && this.providerConfig.pricingPolicy === 'fixed') {
            this.providerConfig.minStorageRate = this.providerConfig.storageRate;
        }
        this.providerConfig.maxStorageRate = Math.max(this.providerConfig.maxStorageRate, this.providerConfig.minStorageRate);
        this.providerConfig.maxStorageRate = Math.max(this.providerConfig.maxStorageRate, this.providerConfig.storageRate);

        this.http.post(`${appConfig['providerAddress']}/config`, this.providerConfig)
            .subscribe((response: any) => {
                console.log(response);
            }, (error: HttpErrorResponse) => {
                console.error('Unable to post provider config.');
                console.error('Error:', error);
            });
        this.dialogRef.close();
    }

    autoUpdateIp() {
        this.http.get('http://ipinfo.io')
            .subscribe((response: any) => {
                this.publicApiIp = response.ip;
                console.log(response);
            });
    }
}
