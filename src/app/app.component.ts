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
        // console.log('here yo');
    }

    ngOnInit(): void {
        // TODO: IPC handling probably should move to login or some other component. Leaving in app component seems to be causing issues.
        // this.electronService.ipcRenderer
        //     .on('skybin', (event, ...args) => {
        //         for (const arg of args) {
        //             console.log(arg);
        //         }
        //     })
        //     .on('loginStatus', (even, ...args) => {
        //         const loginStatus: boolean = args[0];
        //         if (loginStatus) {
        //             this.router.navigate(['/my-files'], {relativeTo: this.route});
        //         } else {
        //             this.router.navigate(['/register']);
        //         }
        //     });
		//
        // // Notify the Electron main process that GUI is launched and ready for IPC.
        // this.electronService.ipcRenderer.send('viewLaunch', true);
    }
}
