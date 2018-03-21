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
        publicApiIp: '165.123.12.12',
        publicApiPort: ':8003',
        localApiAddress: '165.123.12.12:8004',
        spaceAvail: 9999999999,
        storageRate: 30,
    };

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
                this.settings.publicApiIp = ip.substr(0, ip.indexOf(':'));
                this.settings.publicApiPort = ip.substr(ip.indexOf(':') + 1);

            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider configuration.');
                console.error('Error:', error);
            });
    }

    updateProviderSettings() {
        // TODO: add validation checks on ip and port
        // TODO: dialog suggesting reboot of application if ip changed
        this.settings.publicApiAddress =  this.settings.publicApiIp + ":" + this.settings.publicApiPort;
        this.http.post(`${appConfig['providerAddress']}/config`, this.settings)
            .subscribe((response: any) => {
                console.log(response);
            }, (error: HttpErrorResponse) => {
                console.error('Unable to post provider config.');
                console.error('Error:', error);
            });
        this.dialogRef.close();
    }
    // function ValidateIPaddress(ipaddress) {
    //     if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    //         return true;
    //     }
    //     alert("You have entered an invalid IP address!");
    //     return false;
    // }
}
