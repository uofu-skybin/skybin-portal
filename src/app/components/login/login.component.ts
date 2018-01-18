import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ElectronService} from 'ngx-electron';

// const { shell } = electron;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
    // private metaserverRunning: boolean;
    // private providerRunning: boolean;

    constructor(private electronService: ElectronService) {
        // this.metaserverRunning = false;
        // this.providerRunning = false;
    }

    ngOnInit() {
        // this.electronService.ipcRenderer
        //     .on('skybin', (event, ...args) => {
        //         for (const arg of args) {
        //             console.log(arg);
        //         }
        //     })
        //     .on('loginStatus', (even, ...args) => {
        //         for (const arg of args) {
        //             console.log(arg);
        //         }
        //     });
    }

    toggleMetaserver() {
        // const newRunningState: boolean = !this.metaserverRunning;
        // this.metaserverRunning = newRunningState;
        // this.electronService.ipcRenderer.send('metaserverChannel', newRunningState);
    }

    toggleProvider() {
        // const newRunningState: boolean = !this.providerRunning;
        // this.providerRunning = newRunningState;
        // this.electronService.ipcRenderer.send('providerChannel', newRunningState);
    }
}
