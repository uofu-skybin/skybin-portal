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
export class ProvideStorageComponent implements OnInit {

    providerInfo: ProviderInfo = {
        providerId: 'asdasdkjfiawejfklasdjfl;ajsfd',
        storageAllocated: 1e9,
        storageFree: 1e3,
        storageReserved: 1e6,
        storageUsed: 1e4,
        totalContracts: 234,
        totalBlocks: 3587,
        totalRenters: 128,
    };
    providerStats: any = {
        activityCounters: {
            timestamps: [new Date().toString(), new Date().toString(), new Date().toString(), new Date().toString(), new Date().toString()],
            blockUploads: [112, 238, 124, 38, 23],
            blockDownloads: [28, 5, 34, 120, 63],
            blockDeletions: [32, 35, 2, 1, 5],
            storageReservations: [2, 1, 3, 0, 5],
            bytesUploaded: [20000, 30000, 21000, 23000, 34000],
            bytesDownloaded: [19384, 23842, 38492, 29384, 10245],
        }
    };
    pastWeekSummary: any = {
        period: 'Week',
        counters: {
            blockUploads: 485,
            blockDownloads: 236,
            blockDeletions: 22,
            storageReservations: 12,
        },
    };

    constructor(private http: HttpClient,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.http.get(`${appConfig['providerAddress']}/info`).subscribe((info: ProviderInfo) => {
            this.providerInfo = info;
        }, (error) => {
            console.error('Error fetching provider info');
            console.error(error);
        });
        this.http.get(`${appConfig['providerAddress']}/stats`).subscribe((stats: any) => {
            this.providerStats = stats;
        }, (error) => {
            console.error('Error fetching provider stats');
            console.error(error);
        });

        this.drawStorageUsedChart();
        this.drawRequestsChart();
        this.drawThroughputChart();
    }

    settingsClicked() {
        console.log('settings clicked');
    }

    drawStorageUsedChart() {
        let ctxt = document.getElementById('storage-pie-chart');
        let chart = new Chart(ctxt, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        this.providerInfo.storageAllocated,
                        this.providerInfo.storageUsed,
                    ],
                    backgroundColor: [
                        'lightgrey',
                        'grey'
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

    drawRequestsChart() {
        const counters = this.providerStats.activityCounters;

        // Get hours of the counter timestamps as x-axis labels.
        const labels = counters.timestamps
            .map(dateString => new Date(dateString))
            .map(date => date.getHours().toString());

        const datasets = [
            {
                label: 'Block Uploads',
                data: counters.blockUploads,
            },
            {
                label: 'Block Downloads',
                data: counters.blockDownloads,
            },
            {
                label: 'Block Deletions',
                data: counters.blockDeletions,
            },
            {
                label: 'Storage Reservations',
                data: counters.storageReservations,
            },
        ];
        const title = `Request Activity - Last ${labels.length} Hours`;
        let ctxt = document.getElementById('requests-chart');
        let chart = new Chart(ctxt, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                title: {
                    display: true,
                    text: title,
                },
                scales: {
                    xAxes: [{
                        display: true,
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Hour',
                        },
                    }],
                    yAxes: [{
                        display: true,
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Requests',
                        },
                    }],
                },
                legend: {
                    display: false,
                },
            },
        });
    }

    drawThroughputChart() {
        const counters = this.providerStats.activityCounters;

        const labels = counters.timestamps
            .map(dateString => new Date(dateString))
            .map(date => date.getHours().toString());

        const datasets = [
            {
                label: 'Bytes Uploaded',
                data: counters.bytesUploaded,
            },
            {
                label: 'Bytes Downloaded',
                data: counters.bytesDownloaded,
            },
        ];

        const title = `Uploads and Downloads - Last ${labels.length} Hours`;

        let ctxt = document.getElementById('throughput-chart');
        let chart = new Chart(ctxt, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                title: {
                    display: true,
                    text: title,
                },
                scales: {
                    xAxes: [{
                        display: true,
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Hour',
                        },
                    }],
                    yAxes: [{
                        display: true,
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Bytes Transferred',
                        },
                    }],
                },
                legend: {
                    display: false,
                },
            },
        });
    }

}
