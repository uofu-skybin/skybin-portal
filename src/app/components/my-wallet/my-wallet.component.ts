import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import {appConfig} from '../../models/config';
import { RenterInfo, ProviderInfo } from '../../models/common';
import { Location } from '@angular/common';
import {RenterService} from '../../services/renter.service';
import {ElectronService} from 'ngx-electron';
import { HttpClient } from '@angular/common/http';
import paypal = require('paypal-checkout');

@Component({
    selector: 'app-my-wallet',
    templateUrl: './my-wallet.component.html',
    styleUrls: ['./my-wallet.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyWalletComponent implements OnInit {
    @ViewChild('paypalButton') paypalButton: ElementRef;

    renterBalance: number;
    providerBalance: number;

    depositAmount: number;

    renterWithdrawAmount: number;
    renterWithdrawEmail: string;

    providerWithdrawAmount: number;
    providerWithdrawEmail: string;

    isProviderSetup = false;

    constructor(
        private http: HttpClient,
        private renterService: RenterService,
        private router: Router,
        private location: Location,
        public electronService: ElectronService,
    ) { 
        this.updateRenterBalance();
        this.updateProviderBalance();
        this.isProviderSetup = electronService.ipcRenderer.sendSync('isProviderSetup');
    }

    ngOnInit() {
        
    }

    ngAfterViewInit() {
        paypal.Button.render({
            env: 'sandbox',
            payment: () => {
                this.electronService.ipcRenderer.send('close-paypal', '');
                let url = window.location.href.replace('my-wallet', 'index.html');
                console.log(url)
                return paypal.request.post(
                    `${appConfig['renterAddress']}/paypal/create`,
                    {
                        'amount': this.depositAmount * 100,
                        'returnURL': url,
                        'cancelURL': url,
                    }
                ).then(function(data) { return data.id; });
            },
    
            // Pass a function to be called when the customer approves the payment,
            // then call execute payment on your server:
    
            onAuthorize: (data) => {
                return paypal.request.post(`${appConfig['renterAddress']}/paypal/execute`,
                {
                    paymentID: data.paymentID,
                    payerID: data.payerID,
                }).then(() => {
                    console.log('payment success');
                    this.updateRenterBalance();
                })
            },
    
            // Pass a function to be called when the customer cancels the payment
    
            onCancel: function(data) {
    
                console.log('The payment was cancelled!');
                console.log('Payment ID = ', data.paymentID);
            }
    
        }, this.paypalButton.nativeElement);
    }

    updateRenterBalance() {
        this.renterService.getRenterInfo()
            .subscribe(res => {
                this.renterBalance = res.balance / 1000;
            });
    }

    updateProviderBalance() {
        this.http.get(`${appConfig['providerAddress']}/private-info`).subscribe((info: ProviderInfo) => {
            this.providerBalance = info.balance / 1000;
        }, (error) => {
            console.error('Error fetching provider info');
            console.error(error);
        });
    }

    renterWithdrawClicked() {
        this.renterService.withdraw(
            this.renterWithdrawEmail, 
            this.renterWithdrawAmount * 100)
            .subscribe(() => {
                console.log('successfully withdrew');
                this.updateRenterBalance();
            })
    }

    providerWithdrawClicked() {
        let payload = {
            email: this.providerWithdrawEmail,
            amount: this.providerWithdrawAmount * 100
        }
        this.http.post(`${appConfig['providerAddress']}/paypal/withdraw`, payload)
        .subscribe(() => {
            this.updateProviderBalance()
        }, (error) => {
            console.error('Error depositing');
            console.error(error);
        });
    }

    providerInputDisabled() {
        return this.isProviderSetup;
    }
}
