import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-add-storage',
    templateUrl: './add-storage.component.html',
    styleUrls: ['./add-storage.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddStorageComponent implements OnInit {

    // Renter info object returned from the renter service.
    private renterInfo: any = {};

    private settings: any = {
        redundancy: 3,
        minContractDuration: 300000,
        maxContractDuration: 300000,
        maxPricePerGbPerMonth: 30,
    };

    // Storage space to reserve with a click to reserve.
    storageAmount: number = null;

    constructor(private http: HttpClient,
                public dialogRef: MatDialogRef<AddStorageComponent>) {
        this.updateRenterInfo();
    }

    ngOnInit() {
        this.updateRenterInfo();
    }

    reserveClicked() {
        if (!this.storageAmount || this.storageAmount <= 0) {
            return;
        }
        const params = {
            amount: this.storageAmount
        };
        this.http.post('http://localhost:8002/storage', params)
            .subscribe((resp: any) => {
                this.updateRenterInfo();
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
        this.storageAmount = 0;
        this.dialogRef.close();
    }

    updateRenterInfo() {
        this.http.get('http://localhost:8002/info')
            .subscribe((resp: any) => {
                this.renterInfo = resp;
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
    }

    formatBytes(n) {
        if (!n) {
            return '';
        }

        let amt = n;
        let suffix = 'B';

        if (n > 1e9) {
            amt = n / 1e9;
            suffix = 'GB';
        } else if (n > 1e6) {
            amt = n / 1e6;
            suffix = 'MB';
        } else if (n > 1e3) {
            amt = n / 1e3;
            suffix = 'KB';
        }

        if (amt % 1 !== 0) {
            amt = amt.toFixed(1);
        }

        return amt + suffix;
    }
}
