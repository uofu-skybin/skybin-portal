import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import paypal = require('paypal-checkout');

@Component({
    selector: 'app-my-wallet',
    templateUrl: './my-wallet.component.html',
    styleUrls: ['./my-wallet.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyWalletComponent implements OnInit {
    @ViewChild('paypalButton') paypalButton: ElementRef;

    constructor() { }

    ngOnInit() {
        
    }

    ngAfterViewInit() {
        paypal.Button.render({
            payment: function() {
                return new paypal.Promise(function(resolve, reject) {
    
                    // Make an ajax call to get the Payment ID. This should call your back-end,
                    // which should invoke the PayPal Payment Create api to retrieve the Payment ID.
    
                    // When you have a Payment ID, you need to call the `resolve` method, e.g `resolve(data.paymentID)`
                    // Or, if you have an error from your server side, you need to call `reject`, e.g. `reject(err)`
    
                    // $.post('/my-api/create-payment')
                        // .done(function(data) { resolve(data.paymentID); })
                        // .fail(function(err)  { reject(err); });
                });
            },
    
            // Pass a function to be called when the customer approves the payment,
            // then call execute payment on your server:
    
            onAuthorize: function(data) {
    
                console.log('The payment was authorized!');
                console.log('Payment ID = ',   data.paymentID);
                console.log('PayerID = ', data.payerID);
    
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
