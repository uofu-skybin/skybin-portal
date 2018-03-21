import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { appConfig } from '../../models/config';
import { ConfigureProviderComponent } from '../dialogs/configure-provider/configure-provider.component';
import { Activity, ActivityResponse, Contract, ContractsResponse, ProviderInfo } from '../../models/common';
import * as Chart from 'chart.js';
import { MatDialog } from '@angular/material';
import {beautifyBytes} from '../../pipes/bytes.pipe';

// import * as d3 from 'd3';
// import * as Rickshaw from 'rickshaw';
// console.log('got rickshaw!');
// console.log('rickshaw:', Rickshaw);
// console.log('d3:', d3);
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
        storageAllocated: 10 * 1e9,
        storageFree: 3 * 1e9,
        storageReserved: 7 * 1e9,
        storageUsed: 3 * 1e9,
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
        },
        recentSummary: {
            hour: {
                blockUploads: 485,
                blockDownloads: 236,
                blockDeletions: 22,
                storageReservations: 12,
            },
            day: {
                blockUploads: 485,
                blockDownloads: 236,
                blockDeletions: 22,
                storageReservations: 12,
            },
            week: {
                blockUploads: 485,
                blockDownloads: 236,
                blockDeletions: 22,
                storageReservations: 12,
            },
        },
    };


    constructor(private http: HttpClient,
        private dialog: MatDialog,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.http.get(`${appConfig['providerAddress']}/info`).subscribe((info: ProviderInfo) => {
            this.providerInfo = info;
            this.drawStorageUsedChart();
        }, (error) => {
            console.error('Error fetching provider info');
            console.error(error);
        });
        this.http.get(`${appConfig['providerAddress']}/stats`).subscribe((stats: any) => {
            this.providerStats = stats;
            this.drawRequestsChart();
            this.drawThroughputChart();
        }, (error) => {
            console.error('Error fetching provider stats');
            console.error(error);
        });
        // debug for ng serve
        this.drawRequestsChart();
        this.drawThroughputChart();
        this.drawStorageUsedChart();
    }

    settingsClicked() {
        const settingsDialog = this.dialog.open(ConfigureProviderComponent, {
            width: '600px',
        });
        settingsDialog.afterClosed().subscribe(() => {
            this.ngOnInit();
        });
    }

    drawStorageUsedChart() {
        let ctxt = document.getElementById('storage-pie-chart');
        let chart = new Chart(ctxt, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        this.providerInfo.storageUsed,
                        this.providerInfo.storageReserved - this.providerInfo.storageUsed,
                        this.providerInfo.storageFree,
                    ],
                    // backgroundColor: [
                    //     'rgb(255, 109, 95)',
                    //     'rgb(69, 154, 255)',
                    //     'rgb(177, 204, 35)',
                    // ],
                    backgroundColor: [
                        'darkblue',
                        'lightblue',
                        'lightgrey',
                    ],
                }],
                labels: [
                    'Used',
                    'Reserved',
                    'Unused',
                ],
            },
            options: {
                title: {
                    display: true,
                    text: 'Storage Used',
                },
                tooltips: {
                    callbacks: {
                        label: function(item, data) {
                            var dataset = data.datasets[item.datasetIndex];
                            return data.labels[item.index] + ": " +
                                beautifyBytes(dataset.data[item.index]);
                        },
                    },
                },
            },

        });
    }

    drawRequestsChart() {
        const counters = this.providerStats.activityCounters;

        // Get hours of the counter timestamps as x-axis labels.
        const labels = counters.timestamps;
        const datasets = [
            {
                label: 'Block Uploads',
                data: counters.blockUploads,
                backgroundColor: 'rgb(73, 91, 204)',
            },
            {
                label: 'Block Downloads',
                data: counters.blockDownloads,
                backgroundColor: 'rgb(103, 110, 153)',
            },
            {
                label: 'Block Deletions',
                data: counters.blockDeletions,
                backgroundColor: 'rgb(69, 193, 255)',
            },
            {
                label: 'Storage Reservations',
                data: counters.storageReservations,
                backgroundColor: 'rgb(255, 183, 133)',
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
                        type: 'time',
                            time: {
                                unit: 'hour',
                                unitStepSize: 1,
                                displayFormats: {
                                    'hour': 'h:mm a',
                                },
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
                },
                    tooltips: {
                        mode: 'x-axis',
                        callbacks: {
                            title: function (item, data) {
                                var start = new Date(item[0].xLabel);
                                var end = new Date(item[0].xLabel);
                                end.setHours(start.getHours() + 1);
                                return start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    + "-" + end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            },
                        },
                },
            },
        });
    }

    drawThroughputChart() {
        const counters = this.providerStats.activityCounters;

        const labels = counters.timestamps

        const datasets = [
            {
                label: 'Bytes Uploaded',
                data: counters.bytesUploaded,
                backgroundColor: 'rgb(69, 154, 255)',
                borderColor: 'rgb(69, 154, 255)',
                fill: false,
            },
            {
                label: 'Bytes Downloaded',
                data: counters.bytesDownloaded,
                backgroundColor: 'rgb(177, 204, 35)',
                borderColor: 'rgb(177, 204, 35)',
                fill: false,
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
                        // stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Hour',
                        },
                        type: 'time',
                        time: {
                            unit: 'hour',
                            unitStepSize: 1,
                            displayFormats: {
                                'hour': 'h:mm a',
                            },
                        },
                    }],
                    yAxes: [{
                        display: true,
                        // stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Bytes Transferred',
                        },
                        ticks: {
                            userCallback: function (item) {
                                return beautifyBytes(item);
                            },
                        },
                    }],

                },
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                },
                legend: {
                },
                tooltips: {
                    mode: 'x-axis',
                    callbacks: {
                        label: function (item, data) {
                            var dataset = data.datasets[item.datasetIndex];
                            return beautifyBytes(dataset.data[item.index]);
                        },
                        title: function (item, data) {
                            var start = new Date(item[0].xLabel);
                            var end = new Date(item[0].xLabel);
                            end.setHours(start.getHours() + 1);
                            return start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                + "-" + end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        },
                    },
                },
            },
        });
    }

    formatProviderId(providerId: string) {
        if (providerId.length < 15) {
            return providerId;
        }
        return providerId.slice(0, 15) + '...';
    }

}
