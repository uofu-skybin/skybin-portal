import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import Timer = NodeJS.Timer;


// The provider API address to access
const PROVIDER_ADDR = 'http://localhost:8003';

// Activity feed update interval (ms)
const ACTIVITY_INTERVAL = 5 * 1000;

@Component({
    selector: 'app-provide-storage',
    templateUrl: './provide-storage.component.html',
    styleUrls: ['./provide-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ProvideStorageComponent implements OnInit, OnDestroy, AfterViewInit {
    private myContracts: Contract[] = [];

    // TODO convert to structure as opposed to any object
    providerInfo: InfoResponse = {};
    activityFeed: Activity[] = [];
    displayedColumns = ['Request Type', 'Block ID', 'Renter ID', 'Timestamp', 'Contract'];
    dataSource = new MatTableDataSource<Activity>();
    activityPollId: Timer = null;

    // TODO make dynamic
    wallets = [
        { value: 'wallet-0', viewValue: 'Wallet 1' },
        { value: 'wallet-1', viewValue: 'Wallet 2' },
        { value: 'wallet-2', viewValue: 'Wallet 3' }
    ];

    @ViewChild(MatSort) sort: MatSort;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.loadProviderInfo();
        this.loadContracts();
        // this.loadTestActivityData();
        this.loadActivity();
        console.log('starting poll service...');
        this.activityPollId = setInterval(() => this.loadActivity(), ACTIVITY_INTERVAL);
    }

    // Necessary for the mat-table column sorting.
    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    // Delete the polling service in memory when leaving this tab view.
    ngOnDestroy(): void {
        console.log('destroying poll service. . .');
        clearInterval(this.activityPollId);
    }

    private loadContracts() {
        this.http.get<ContractsResponse>(`${PROVIDER_ADDR}/contracts`).subscribe(response => {
            const contracts = response['contracts'];
            if (!contracts) {
                console.error('Error: GET /contracts returned no contracts.');
                console.error('Response:', response);
                return;
            }
            this.myContracts.push(...contracts);
        });
    }

    loadProviderInfo() {
        this.http.get(`${PROVIDER_ADDR}/info`)
            .subscribe((response: any) => {
                this.providerInfo = response;
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider info.');
                console.error('Error:', error);
            });
    }

    private loadActivity() {
        this.http.get<ActivityResponse>(`${PROVIDER_ADDR}/activity`)
            .subscribe(response => {
                const activity = response['activity'];
                if (!activity) {
                    console.error('Error: GET /activity returned no activity.');
                    console.error('Response:', response);
                    return;
                }
                console.log('polled data with response ', activity);

                // Only take up to five most recent items.
                this.activityFeed = response.activity.reverse().slice(0, 5);
                this.dataSource = new MatTableDataSource<Activity>(this.activityFeed);
            }, (error) => {
                console.error('Unable to load provider activity feed.');
                console.error('Error:', error);
            });
    }

    private loadTestActivityData() {
        // setInterval(() => {
        //     this.activityFeed.push(
        //         {
        //             requestType: 'NEGOTIATE CONTRACT',
        //             blockId: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF',
        //             renterId: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF',
        //             time: new Date(),
        //             contract: {
        //                 storageSpace: '10 GB',
        //                 renterID: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF'
        //             }
        //         }
        //     );
        //     this.dataSource = new MatTableDataSource<Activity>(this.activityFeed);
        // }, 3 * 1000);
        // this.activityFeed.push(
        //     {
        //         requestType: 'NEGOTIATE CONTRACT',
        //         blockId: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF',
        //         renterId: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF',
        //         time: new Date(),
        //         contract: {
        //             storageSpace: '10 GB',
        //             renterID: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF'
        //         }
        //     },
        //     {
        //         requestType: 'PUT BLOCK',
        //         blockId: null,
        //         renterId: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF',
        //         time: new Date(),
        //         contract: {
        //             storageSpace: '1 GB',
        //             renterID: '4PNCQEERAP46XZW6OZQQEHZLLCK7NKFF'
        //         }
        //     },
        // );
    }
}

export interface InfoResponse {
    providerId?: string;
    providerAllocated?: number;
    providerReserved?: number;
    providerUsed?: number;
    providerFree?: number;
    providerContracts?: number;
}

export interface Contract {
    storageSpace: string;
    renterID: string;
}

export interface ContractsResponse {
    contracts: Contract[];
}

export interface ActivityResponse {
    activity: Activity[];
}

export interface Activity {
    requestType?: string;
    blockId?: string;
    renterId?: string;
    time?: Date;
    contract?: Contract;
}

// displayedColumns = ['Request Type', 'Block ID', 'Renter ID', 'Time Stamp', 'Contract'];
const DATA: Activity[] = [
    { requestType: 'GET', blockId: '1', renterId: '1', time: new Date(), contract: { storageSpace: '100 KB', renterID: '1' } }
];
