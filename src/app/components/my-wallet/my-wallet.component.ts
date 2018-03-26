import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import {appConfig} from '../../models/config';
import { RenterInfo } from '../../models/common';
import {RenterService} from '../../services/renter.service';
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

    constructor(private renterService: RenterService) { 
        this.renterService.getRenterInfo()
            .subscribe(res => {
                this.renterId = res.id;
            });
    }

    ngOnInit() {
        
    }

    ngAfterViewInit() {
        paypal.Button.render({
            env: 'sandbox',
            payment: function() {
                return paypal.request.post(`${appConfig['renterAddress']}/paypal/create`)
                        .then(function(data) { return data.id; });
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
}
