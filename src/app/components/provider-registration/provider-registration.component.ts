import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CurrencyMaskModule} from 'ng2-currency-mask';

@Component({
    selector: 'app-provider-registration',
    templateUrl: './provider-registration.component.html',
    styleUrls: ['./provider-registration.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ProviderRegistrationComponent implements OnInit {

    private MIN_STORAGE_GB = 1;
    private MAX_STORAGE_GB = 10000;

    private errorMessage = '';
    private showRegistrationProgress = false;
    private progressText = '';

    private storageAmountGb = 0;
    public publicApiIp = '';
    public publicApiPort = 8003;
    public minStorageRate = 0.001;
    public storageRate = 0.001;
    public pricingPolicy = 'passive';

    constructor(
        private http: HttpClient,
        private electronService: ElectronService,
        private zone: NgZone,
        private router: Router,
    ) { }

    ngOnInit() {
    }

    registerClicked() {
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

        if (this.storageRate < 0) {
            this.errorMessage = 'Storage Rate must be positive';
            return;
        }

        this.electronService.ipcRenderer.once('setupProviderDone', (event, result) => {
            this.zone.run(() => {
                if (result.error) {
                    this.showRegistrationProgress = false;
                    this.errorMessage = result.error.toString();
                    return;
                }
                this.progressText = 'Done!';
                setTimeout(() => this.router.navigate(['provide-storage']), 250);
            });
        });

        const storageSpace = this.storageAmountGb * 1e9;
        const providerAddr = this.publicApiIp + ':' + this.publicApiPort;
        const minStorageRate = this.minStorageRate * 1000;
        const storageRate = this.storageRate * 1000;
        const providerOptions = {
            storageSpace: storageSpace,
            publicApiAddr: providerAddr,
            minStorageRate: minStorageRate,
            storageRate: storageRate,
            pricingPolicy: this.pricingPolicy,
        };
        this.electronService.ipcRenderer.send('setupProvider', providerOptions);
        this.progressText = 'Setting up your provider.';
        this.showRegistrationProgress = true;
    }

    autoUpdateIp(){
        this.http.get('http://ipinfo.io')
            .subscribe((response: any) => {
                this.publicApiIp = response.ip;
                console.log(response);
            });
    }

}
