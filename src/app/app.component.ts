import {Component, NgZone, OnInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import {ActivatedRoute, Router} from '@angular/router';
import {RenterService} from './services/renter.service';
import {RenterInfo} from './models/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    renterInfo: RenterInfo = new RenterInfo();
    currentPage = 'my-files';

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

    exportRenterKey(): void {
        this.electronService.remote.dialog.showSaveDialog({defaultPath: '*/renterid'}, (destPath: string) => {
            this.electronService.ipcRenderer.send('exportRenterKey', destPath);
        });

    }
}
