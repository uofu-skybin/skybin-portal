import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatSort, MatTableDataSource} from '@angular/material';
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

    // TODO convert to structure as opposed to any object
    providerInfo: any = {};
    displayedColumns = ['action', 'name', 'size', 'date'];
    dataSource = new MatTableDataSource<Info>(DATA);

    @ViewChild(MatSort) sort: MatSort;

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    // TODO make dynamic
    wallets = [
        { value: 'wallet-0', viewValue: 'Wallet 1' },
        { value: 'wallet-1', viewValue: 'Wallet 2' },
        { value: 'wallet-2', viewValue: 'Wallet 3' }
    ];

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.updateProviderInfo();
        this.loadContracts();
        // this.updateProviderActivity()
    }

    private loadContracts() {
        this.http.get<ContractsResponse>('http://127.0.0.1:8003/contracts').subscribe(response => {
            console.log(response);
            if (response.contracts) {
                response.contracts.forEach(contract => {
                    this.myContracts.push(contract);
                });
            }
        });
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

    updateProviderActivity() {
        // this.http.get('http://localhost:8003/activity')
        //     .subscribe((resp: any) => {
        //         this.providerInfo = resp;
        //     }, (error: HttpErrorResponse) => {
        //         console.error(error);
        //     });
        // console.log(this.providerInfo);
    }

}

export interface Info {
    action: string;
    name: string;
    size: number;
    date: string;
}

const DATA: Info[] = [
    {action: 'GET', name: 'GetBlock', size: 100, date: '12-12-12'},
    {action: 'POST', name: 'PostBlock', size: 23, date: '1-23-17'},
    {action: 'PUT', name: 'PutBlock', size: 3, date: '4-1-15'},
    {action: 'DELETE', name: 'DeleteBlock', size: 88, date: '11-01-15'},
    {action: 'GET', name: 'GetBlock', size: 100, date: '12-12-12'},
    {action: 'GET', name: 'GetBlock', size: 100, date: '12-12-12'},
    {action: 'GET', name: 'GetBlock', size: 100, date: '12-12-12'},
    {action: 'POST', name: 'PostBlock', size: 23, date: '1-23-17'},
    {action: 'PUT', name: 'PutBlock', size: 3, date: '4-1-15'},
    {action: 'DELETE', name: 'DeleteBlock', size: 88, date: '11-01-15'},
    {action: 'POST', name: 'PostBlock', size: 23, date: '1-23-17'},
    {action: 'PUT', name: 'PutBlock', size: 3, date: '4-1-15'},
    {action: 'DELETE', name: 'DeleteBlock', size: 88, date: '11-01-15'},
    {action: 'POST', name: 'PostBlock', size: 23, date: '1-23-17'},
    {action: 'PUT', name: 'PutBlock', size: 3, date: '4-1-15'},
    {action: 'DELETE', name: 'DeleteBlock', size: 88, date: '11-01-15'},
]
