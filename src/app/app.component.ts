import {Component, NgZone, OnInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import {ActivatedRoute, Router} from '@angular/router';
import {RenterService} from './services/renter.service';
import {RenterInfo} from './models/common';
import {MatSnackBar} from '@angular/material';
import {NotificationComponent} from './components/notification/notification.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    renterInfo: RenterInfo = new RenterInfo();

    constructor(private electronService: ElectronService,
                private router: Router,
                private route: ActivatedRoute,
                private zone: NgZone,
                private renterService: RenterService) {
    }

    ngOnInit(): void {
        this.router.navigate(['my-files']);
        this.renterService.getRenterInfo()
            .subscribe(renterInfo => {
                this.renterInfo = renterInfo;
            });

        // Listen for new storage reservations.
        this.renterService.storageChangeEmitted$.subscribe(addedStorage => {
            this.renterInfo.freeStorage += addedStorage;
        });
    }

    onDrop(e) {
        e.preventDefault();
    }

    onDragOver(e) {
        e.preventDefault();
    }
}
