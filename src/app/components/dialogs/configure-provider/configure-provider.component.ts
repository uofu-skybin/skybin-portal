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
        publicApiAddress: '165.123.12.12:8003',
        localApiAddress: '165.123.12.12:8004',
        spaceAvail: 9999999999,
        storageRate: 30,
    };
    public storageAmountGb = 0;
    public publicApiIp = '165.123.12.12';
    public publicApiPort = ':8003';

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
                this.publicApiPort = ip.substr(ip.indexOf(':') + 1);
                this.storageAmountGb = this.settings.spaceAvail / 1e9;
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
