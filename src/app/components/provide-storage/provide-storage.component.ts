import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import Timer = NodeJS.Timer;
import { appConfig } from '../../models/config';
import { Activity, ActivityResponse, Contract, ContractsResponse, ProviderInfo } from '../../models/common';
import * as d3 from 'd3';
import * as Rickshaw from 'rickshaw';
import * as Chart from 'chart.js';

// Activity feed update interval (ms)
const ACTIVITY_INTERVAL = 5 * 1000;

console.log('got rickshaw!');
console.log('rickshaw:', Rickshaw);
console.log('d3:', d3);
console.log('chartjs', Chart);

@Component({
    selector: 'app-provide-storage',
    templateUrl: './provide-storage.component.html',
    styleUrls: ['./provide-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ProvideStorageComponent implements OnInit, OnDestroy, AfterViewInit {
    private myContracts: Contract[] = [];

    providerInfo: ProviderInfo = {};
    activityFeed: Activity[] = [];
    displayedColumns = ['Request Type', 'Block ID', 'Renter ID', 'Timestamp'];
    dataSource = new MatTableDataSource<Activity>();
    activityPollId: Timer = null;

    // TODO make dynamic
    wallets = [
        { value: 'wallet-0', viewValue: 'Wallet 1' },
        { value: 'wallet-1', viewValue: 'Wallet 2' },
        { value: 'wallet-2', viewValue: 'Wallet 3' }
    ];
    @ViewChild(MatSort) sort: MatSort;

    constructor(private http: HttpClient,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        // this.loadProviderInfo();
        // this.loadContracts();
        // // this.loadTestActivityData();
        // this.loadActivity();
        // console.log('starting poll service...');
        // this.activityPollId = setInterval(() => this.loadActivity(), ACTIVITY_INTERVAL);

        this.drawChart();
        this.drawStorageUsed();
    }

    drawStorageUsed() {
        let ctxt = document.getElementById('storagePieChart');
        let chart = new Chart(ctxt, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [10000, 7500],
                    backgroundColor: [
                        'red',
                        'blue'
                    ],
                }],
                labels: [
                    'Allocated',
                    'Used',
                ],
            },
            options: {
                title: {
                    display: true,
                    text: 'Storage Used',
                },
            },
        });
    }

    drawChart() {
        // let graph = new Rickshaw.Graph({
        //     element: document.querySelector('#chart'),
        //     width: 500,
        //     height: 300,
        //     series: [{
        //         color: 'steelblue',
        //         data: [
        //             { x: 1, y: 10 },
        //             { x: 2, y: 20 },
        //             { x: 3, y: 30 },
        //             { x: 4, y: 40 },
        //             { x: 5, y: 50 },
        //         ]
        //     }]
        // });

        // let xAxis = new Rickshaw.Graph.Axis.X({
        //     graph: graph,
        // });

        // let yAxis = new Rickshaw.Graph.Axis.Y({
        //     graph: graph,
        //     // element: document.getElementById('y-axis'),
        // });

        // let hoverDetail = new Rickshaw.Graph.HoverDetail({
        //     graph: graph,
        //     xFormatter: (x) => x + 'something',
        //     yFormatter: (y) => y + 'value',
        // });

        // graph.render();

        let ctxt = (<any>document.getElementById('myChart')).getContext('2d');
        let myChart = new Chart(ctxt, {
            type: 'line',
            data: {
                // label: 'Storage Contracts over Time',
                datasets: [
                    {
                        labels: ['a', 'b', 'c', 'd', 'e'],
                        data: [3, 4, 5, 6, 7, 3, 4, 5, 7, 12],
                    }
                ],
            },
            options: {
                title: {
                    display: true,
                    text: 'Storage Use Over Time',
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Date',
                        },
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Total Contracts',
                        },
                    }],
                },
                legend: {
                    display: false,
                },
            },
        });
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
        this.http.get<ContractsResponse>(`${appConfig['providerAddress']}/contracts`).subscribe(response => {
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
        this.http.get(`${appConfig['providerAddress']}/info`)
            .subscribe((response: any) => {
                this.providerInfo = response;
            }, (error: HttpErrorResponse) => {
                console.error('Unable to load provider info.');
                console.error('Error:', error);
            });
    }

    private loadActivity() {
        this.http.get<ActivityResponse>(`${appConfig['providerAddress']}/activity`)
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

}


// displayedColumns = ['Request Type', 'Block ID', 'Renter ID', 'Time Stamp', 'Contract'];
const DATA: Activity[] = [
    { requestType: 'GET', blockId: '1', renterId: '1', time: new Date(), contract: { storageSpace: '100 KB', renterID: '1' } }
];
