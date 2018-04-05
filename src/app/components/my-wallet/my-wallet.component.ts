import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';
import {appConfig} from '../../models/config';
import { RenterInfo, ProviderInfo, Transaction, TransactionsResponse } from '../../models/common';
import { Location } from '@angular/common';
import {RenterService} from '../../services/renter.service';
import {ElectronService} from 'ngx-electron';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
import {NotificationComponent} from '../notification/notification.component';
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

    transactions: Transaction[] = [];
    dataSource = null;
    displayedColumns = ['date', 'wallet', 'type', 'amount'];

    pageSize = 0;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private renterService: RenterService,
        private router: Router,
        private location: Location,
        public electronService: ElectronService,
        public snackBar: MatSnackBar
    ) { 
        this.updateRenterBalance();
        this.updateProviderBalance();
        this.isProviderSetup = electronService.ipcRenderer.sendSync('isProviderSetup');
    }

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.transactions);
        this.pageSize = this.calculateNumberOfItemsToShow();
        this.getTransactions();
    }

    ngAfterViewInit() {
        this.renderPaypal();

        this.dataSource.paginator = this.paginator;
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
                this.updateRenterBalance();
                this.showNotification("Withdrawal successful!")
                this.renterWithdrawAmount = null;
                this.renterWithdrawEmail = '';
            })
    }

    providerWithdrawClicked() {
        let payload = {
            email: this.providerWithdrawEmail,
            amount: this.providerWithdrawAmount * 100
        }
        // TODO: Make a providerService similar to the renter one.
        this.http.post(`${appConfig['providerAddress']}/paypal/withdraw`, payload)
        .subscribe(() => {
            this.updateProviderBalance()
            this.showNotification("Withdrawal successful!")
            this.providerWithdrawAmount = null;
            this.providerWithdrawEmail = '';
        }, (error) => {
            console.error('Error depositing');
            console.error(error);
        });
    }

    providerInputDisabled() {
        return this.isProviderSetup;
    }

    showNotification(message) {
        this.snackBar.openFromComponent(NotificationComponent, {
            data: message,
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }

    /**
     * Super gross hack to determine the number of rows to show in the table per page.
     * 
     * Basically just take the height of the window, subtract the height of everything that
     * is not the table, then divide the remaining height by the height of an individual row.
     */
    calculateNumberOfItemsToShow() {
        let rowHeight = 49; // 48 + 1 for border
        let otherHeights = 22 +
            81 +
            48 +
            40 +
            24 +
            48 +
            56 +
            24 +
            40;
        let windowHeight = window.innerHeight;
        return Math.floor((windowHeight - otherHeights) / rowHeight);
    }

    getTransactions() {
        this.transactions = [];
        this.renterService.getTransactions().subscribe(res => {
            this.transactions = this.transactions.concat(res.transactions);
            this.dataSource = new MatTableDataSource(this.transactions);
            this.dataSource.paginator = this.paginator;
        })

        this.http.get<TransactionsResponse>(`${appConfig['providerAddress']}/transactions`).subscribe(res => {
            this.transactions = this.transactions.concat(res.transactions);
            this.dataSource = new MatTableDataSource(this.transactions);
            this.dataSource.paginator = this.paginator;
        },
        (error) => {
            this.showNotification(error);
        });
    }

    getDate(time: string) {
        let date =  new Date(time);
        return date.toString();
    }

    onTabSwitched(event: MatTabChangeEvent) {
        // Stupid gross hack. The paypal button blows up if we switch to another tab. So, we remove it when we switch
        // away from the home tab, and rerender it when we switch back.
        if (event.index == 0) {
            this.renderPaypal();
        } else {
            this.paypalButton.nativeElement.innerHTML = '';
        }
    }

    renderPaypal() {
        console.log('rendering paypal butotn');
        paypal.Button.render({
            env: 'sandbox',
            payment: () => {
                this.electronService.ipcRenderer.send('close-paypal', '');
                // HACK! This gets the path to the file by swapping out the route with the file name.
                let url = window.location.href.replace('my-wallet', 'index.html');
                return paypal.request.post(
                    `${appConfig['renterAddress']}/paypal/create`,
                    {
                        'amount': this.depositAmount * 100,
                        'returnURL': url,
                        'cancelURL': url,
                    }
                ).then(function(data) { return data.id; });
            },
    
            onAuthorize: (data) => {
                return paypal.request.post(`${appConfig['renterAddress']}/paypal/execute`,
                {
                    paymentID: data.paymentID,
                    payerID: data.payerID,
                }).then(() => {
                    this.updateRenterBalance();
                    this.showNotification("Deposit successful!");
                    this.depositAmount = null;
                })
            },
    
            // Pass a function to be called when the customer cancels the payment
    
            onCancel: (data) => {
                this.showNotification('Payment canceled!');
            }
    
        }, this.paypalButton.nativeElement);
    }
}
