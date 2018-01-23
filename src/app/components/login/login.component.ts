import {Component, NgZone, OnInit, ViewEncapsulation} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

    constructor(private electronService: ElectronService,
                private router: Router,
                private zone: NgZone) {
    }

    ngOnInit() {
        this.electronService.ipcRenderer.on('registered', (event, ...args) => {
            this.zone.run(() => {
                this.router.navigate(['my-files']);
            });
        });
    }

    /**
     * Acts as a "login" method in that it communicates with the Main Electron process and either creates a new directory/keyID or uses
     * the key passed as an argument.
     */
    login(hasKey = false) {
        if (hasKey) {
            this.electronService.remote.dialog.showOpenDialog({}, (files: string[]) => {
                if (files) {
                    this.electronService.ipcRenderer.send('login', files[0]);
                }
            });
        } else {
            this.electronService.ipcRenderer.send('login', null);
        }
    }

}
