import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

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
    for (let i = 0; i < 10; i++) {
      const date = new Date(2017, Math.floor(Math.random() * 11 + 1), Math.floor(Math.random() * 30 + 1), 0, 0, 0, 0);
      transactions.push({
        'date': date,
        'user': users[Math.round(Math.random() * (users.length - 1))],
        'type': types[Math.round(Math.random() * (types.length - 1))],
        'amount': Math.round(Math.random() * 100 * 100) / 100,
      });
    }
    this.transactions = transactions;
  }

}
