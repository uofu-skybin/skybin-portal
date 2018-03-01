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

    constructor(private http: HttpClient,
                public dialogRef: MatDialogRef<ConfigureProviderComponent>) {
        this.updateProviderInfo();
    }

    ngOnInit() {
        this.updateProviderInfo();
    }

    updateProviderInfo() {
        this.http.get(`${appConfig['providerAddress']}/config`)
            .subscribe((response: any) => {
                this.settings = response;
                console.log(response);
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider configuration.');
                console.error('Error:', error);
            });
    }

    updateProviderSettings() {
        this.http.post(`${appConfig['providerAddress']}/config`, this.settings)
            .subscribe((response: any) => {
                console.log(response);
            }, (error: HttpErrorResponse) => {
                console.error('Unable to post provider config.');
                console.error('Error:', error);
            });
        this.dialogRef.close();
    }

}
