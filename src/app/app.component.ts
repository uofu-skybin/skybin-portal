import {Component, OnInit} from '@angular/core';
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
                private route: ActivatedRoute) {
        // Dynamic routing. Go to my-files if auth'd, login view if not.
        this.electronService.ipcRenderer.on('loginStatus', (event, ...args) => {
            let userExists: boolean = args[0];
            if (userExists) {
                this.router.navigate(['my-files']);
            } else if (!userExists) {
                this.router.navigate(['login']);
            }
        });

        // TODO: navigation works synchronously, but not async
        // this.router.navigate(['my-files']);

        this.electronService.ipcRenderer.send('viewReady', true);
    }

    ngOnInit(): void {
    }
}
