import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import {appConfig} from '../../models/config';
import { RenterInfo } from '../../models/common';
import { Location } from '@angular/common';
import {RenterService} from '../../services/renter.service';
import {ElectronService} from 'ngx-electron';
import paypal = require('paypal-checkout');

@Component({
    selector: 'app-my-wallet',
    templateUrl: './my-wallet.component.html',
    styleUrls: ['./my-wallet.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyWalletComponent implements OnInit {
    @ViewChild('paypalButton') paypalButton: ElementRef;

    renterId: string;
    renterBalance: number;
    depositAmount: number;
    withdrawAmount: number;
    withdrawEmail: string;

    constructor(
        private renterService: RenterService,
        private router: Router,
        private location: Location,
        public electronService: ElectronService,
    ) { 
        this.updateBalance();
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
                        'amount': this.depositAmount,
                        'returnURL': url,
                        'cancelURL': url,
                    }
                ).then(function(data) { return data.id; });
            },
    
            // Pass a function to be called when the customer approves the payment,
            // then call execute payment on your server:
    
            onAuthorize: (data) => {
                console.log(this.renterId);
                return paypal.request.post(`${appConfig['renterAddress']}/paypal/execute`,
                {
                    paymentID: data.paymentID,
                    payerID: data.payerID,
                    renterID: this.renterId,
                }).then(() => {
                    console.log('payment success');
                    this.updateBalance();
                })
                // console.log('The payment was authorized!');
                // console.log('Payment ID = ',   data.paymentID);
                // console.log('PayerID = ', data.payerID);
    
                // At this point, the payment has been authorized, and you will need to call your back-end to complete the
                // payment. Your back-end should invoke the PayPal Payment Execute api to finalize the transaction.
    
                // jQuery.post('/my-api/execute-payment', { paymentID: data.paymentID, payerID: data.payerID })
                //     .done(function(data) { /* Go to a success page */ })
                //     .fail(function(err)  { /* Go to an error page  */  });
            },
    
            // Pass a function to be called when the customer cancels the payment
    
            onCancel: function(data) {
    
                console.log('The payment was cancelled!');
                console.log('Payment ID = ', data.paymentID);
            }
    
        }, this.paypalButton.nativeElement);
    }

    updateBalance() {
        this.renterService.getRenterInfo()
            .subscribe(res => {
                this.renterId = res.id;
                this.renterBalance = res.balance;
            });
    }

    withdrawClicked() {
        this.renterService.withdraw(this.withdrawEmail, this.withdrawAmount)
            .subscribe(() => {
                console.log('successfully withdrew');
                this.updateBalance();
            })
    }
}
