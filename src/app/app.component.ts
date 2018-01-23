import {Component, NgZone, OnInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private electronService: ElectronService,
                private router: Router,
                private route: ActivatedRoute,
                private zone: NgZone) {
        // Dynamic routing. Go to my-files if auth'd, login view if not.
        this.electronService.ipcRenderer.on('loginStatus', (event, ...args) => {
            let userExists: boolean = args[0];
            if (userExists) {
                this.zone.run(() => {
                    this.router.navigate(['my-files']);
                });
            } else if (!userExists) {
                this.zone.run(() => {
                    this.router.navigate(['login']);
                });
            }
        });

        this.electronService.ipcRenderer.send('viewReady', true);
    }

    ngOnInit(): void {
    }
}
