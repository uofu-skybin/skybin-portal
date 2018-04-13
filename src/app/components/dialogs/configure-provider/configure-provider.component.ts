import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material';
import {appConfig} from '../../../models/config';

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

    public storageAmountGb = 0;
    public publicApiIp = '';
    public publicApiPort = 8003;
    public minStorageRate = 80;
    public maxStorageRate = 200;

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
                this.minStorageRate = this.settings.minStorageRate;
                this.maxStorageRate = this.settings.maxStorageRate;
                // this.pricingPolicy = this.settings.pricingPolicy;
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider configuration.');
                console.error('Error:', error);
            });
    }

    updateProviderSettings() {
        // TODO: add validation checks on ip and port
        // TODO: dialog suggesting reboot of application if ip changed
        this.settings.publicApiAddress =  this.publicApiIp + ':' + this.publicApiPort;
        this.settings.spaceAvail = this.storageAmountGb * 1e9;
        this.settings.minStorageRate = this.minStorageRate;
        this.settings.maxStorageRate = this.maxStorageRate;
        // this.settings.pricingPolicy = this.pricingPolicy;
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
    portChanged(input) {
        if (input.value < 1024) input.value = 1024;
        if (input.value > 65535) input.value = 65535;
    }
}
