import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import {MatTableDataSource} from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http/src/response';


interface Contract {
    storageSpace: string;
    renterID: string;
}

interface ContractsResponse {
    contracts: Contract[];
}

@Component({
    selector: 'app-provide-storage',
    templateUrl: './provide-storage.component.html',
    styleUrls: ['./provide-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class ProvideStorageComponent implements OnInit {
    private myContracts: Contract[] = [];
    private providerInfo: any = {};

    // private dataSource = null;
    // private displayedColumns = ['renterID', 'storageSpace'];

    // TODO make dynamic
    wallets = [
        { value: 'wallet-0', viewValue: 'Wallet 1' },
        { value: 'wallet-1', viewValue: 'Wallet 2' },
        { value: 'wallet-2', viewValue: 'Wallet 3' }
    ];

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.updateProviderInfo()
        this.loadContracts();
        // this.dataSource = new MatTableDataSource(this.myContracts);
        // console.log(this.dataSource);
    }

    private loadContracts() {
        // const myContracts: Contract[] = [];
        this.http.get<ContractsResponse>('http://127.0.0.1:8003/contracts').subscribe(response => {
            console.log(response);
            if (response.contracts) {
                response.contracts.forEach(contract => {
                    this.myContracts.push(contract);
                });
            }
        });

        // this.myContracts = myContracts;
    }

    updateProviderInfo() {
        this.http.get('http://localhost:8003/info')
            .subscribe((resp: any) => {
                this.providerInfo = resp;
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
        console.log(this.providerInfo);
    }

    updateProviderSettings() {
        // TODO: set some stuff here
    }

}
