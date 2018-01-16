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

    constructor(private electronService: ElectronService) {
    }

    ngOnInit() {


        this.electronService.ipcRenderer
            .on('skybin', (event, ...args) => {
                for (const arg of args) {
                    console.log(arg);
                }
            })
            .on('chan1', (even, ...args) => {
                for (const arg of args) {
                    console.log(arg);
                }
            });
    }

    runMetaserver() {
        this.electronService.ipcRenderer.send('chan1', 'run metaserver');
    }

    runProvider() {
        this.electronService.ipcRenderer.send('chan1', 'run provider');
    }
}
