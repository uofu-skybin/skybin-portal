import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

@Component({
    selector: 'app-provider-registration',
    templateUrl: './provider-registration.component.html',
    styleUrls: ['./provider-registration.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ProviderRegistrationComponent implements OnInit {

    private MIN_STORAGE_GB = 1;
    private MAX_STORAGE_GB = 10000;

    private storageAmountGb = 0;
    private errorMessage = '';
    private showRegistrationProgress = false;
    private progressText = '';
    public publicApiIp: '';
    public publicApiPort: ':8003';

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
        const storageSpace = this.storageAmountGb * 1e9;
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
        const providerOptions = {
            storageSpace: storageSpace,
            publicApiAddr: this.publicApiIp + ':' + this.publicApiPort,
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
