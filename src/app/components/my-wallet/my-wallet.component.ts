import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

interface Wallet {
    name: string;
    id: string;
    funds: number;
    spent: number;
    received: number;
}

@Component({
    selector: 'app-my-wallet',
    templateUrl: './my-wallet.component.html',
    styleUrls: ['./my-wallet.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyWalletComponent implements OnInit {

    private transactions = [];
    private dataSource = null;
    private displayedColumns = ['date', 'user', 'type', 'amount'];

    private wallets = [
        {
            name: 'Rent wallet',
            id: '7834-4327-3432',
            funds: 50.00,
            spent: 24.02,
            received: 0
        },
        {
            name: 'Provide wallet',
            id: '4324-7657-4343',
            funds: 124.02,
            spent: 0,
            received: 64.02
        },
    ];

    private empty = {
        name: '',
        id: '',
        funds: 0,
        spent: 0,
        received: 0
    };

    private selected = this.empty;

    constructor() { }

    ngOnInit() {
        this.generateTransactions();
        this.dataSource = new MatTableDataSource(this.transactions);
    }

    generateTransactions() {
        const users = [
            'Kincaid', 'Gradey', 'Zak', 'Alex'
        ];
        const types = [
            'payment',
            'receipt',
        ];
        const transactions = [];
        for (let i = 0; i < 25; i++) {
            const date = new Date(2017, Math.floor(Math.random() * 11 + 1), Math.floor(Math.random() * 30 + 1), 0, 0, 0, 0);
            transactions.push({
                'wallet': this.wallets[Math.round(Math.random() * (this.wallets.length - 1))],
                'date': date,
                'user': users[Math.round(Math.random() * (users.length - 1))],
                'type': types[Math.round(Math.random() * (types.length - 1))],
                'amount': Math.round(Math.random() * 100 * 100) / 100,
            });
        }
        this.transactions = transactions;
    }

    selectWallet(wallet) {
        this.selected = wallet;
    }

    formatDate(date) {
        return date.toLocaleDateString().replace(/\//g, '-');
    }
}
