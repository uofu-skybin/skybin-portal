import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material';
import {appConfig} from '../../../models/config';
import {CurrencyMaskModule} from 'ng2-currency-mask';

@Component({
    selector: 'app-configure-provider',
    templateUrl: './configure-provider.component.html',
    styleUrls: ['./configure-provider.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ConfigureProviderComponent implements OnInit {
    public settings: any = {
        publicApiAddress: ':8003',
        localApiAddress: ':8004',
        spaceAvail: 9999999999,
        storageRate: 30,
        minStorageRate: 80,
        maxStorageRate: 200,
        pricingPolicy: 'aggressive',
    };
    private MIN_STORAGE_GB = 1;
    private MAX_STORAGE_GB = 10000;

    public storageAmountGb = 0;
    public publicApiIp = '';
    public publicApiPort = 8003;
    public minStorageRate = 80;
    public errorMessage = '';

    constructor(private http: HttpClient,
                public dialogRef: MatDialogRef<ConfigureProviderComponent>) {
    }

    ngOnInit() {
        this.updateProviderInfo();
    }

    updateProviderInfo() {
        this.http.get(`${appConfig['providerAddress']}/config`)
            .subscribe((response: any) => {
                this.settings = response;
                let ip = response.publicApiAddress;
                // split ip from port
                this.publicApiIp = ip.substr(0, ip.indexOf(':'));
                this.publicApiPort = parseInt(ip.substr(ip.indexOf(':') + 1));
                this.storageAmountGb = this.settings.spaceAvail / 1e9;
                this.minStorageRate = this.settings.minStorageRate /1000;
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider configuration.');
                console.error('Error:', error);
            });
    }

    updateProviderSettings() {
        // TODO: add validation checks on ip and port
        // TODO: dialog suggesting reboot of application if ip changed
        this.errorMessage = '';
        if (this.storageAmountGb < this.MIN_STORAGE_GB ||
            this.storageAmountGb > this.MAX_STORAGE_GB) {
            this.errorMessage = `You should provide between ${this.MIN_STORAGE_GB} and ${this.MAX_STORAGE_GB} gigabytes of space`;
            return;
        }

        if (this.publicApiPort < 1024 || this.publicApiPort > 65535){
            this.errorMessage = 'Port must be in the range 1024-65535';
            return;
        }

        if (this.minStorageRate < 0 || this.minStorageRate > 100) {
            this.errorMessage = 'Storage Rate must be between 0.000 and 10.000';
            return;
        }

        this.settings.publicApiAddress =  this.publicApiIp + ':' + this.publicApiPort;
        this.settings.spaceAvail = this.storageAmountGb * 1e9;
        this.settings.minStorageRate = this.minStorageRate * 1000;

        this.http.post(`${appConfig['providerAddress']}/config`, this.settings)
            .subscribe((response: any) => {
                console.log(response);
            }, (error: HttpErrorResponse) => {
                console.error('Unable to post provider config.');
                console.error('Error:', error);
            });
        this.dialogRef.close();
    }

    autoUpdateIp(){
        this.http.get('http://ipinfo.io')
            .subscribe((response: any) => {
                this.publicApiIp = response.ip;
                console.log(response);
            });
    }
}
