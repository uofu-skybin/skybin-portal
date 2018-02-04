import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

    constructor(private dialogRef: MatDialogRef<LoginComponent>,
        private electronService: ElectronService,
        private router: Router,
        private zone: NgZone) {
    }

    ngOnInit() {
    }

    login(hasKey = false) {

        // TODO(gradey): ask for these things too :)
        const renterAlias = null;
        const homeFolder = null;
        const setupOptions = {
            renterAlias: renterAlias,
            homeFolder: homeFolder,
            keyFile: null,
        };

        console.log('login ok');

        if (hasKey) {
            this.electronService.remote.dialog.showOpenDialog({}, (keyFiles: string[]) => {
                if (keyFiles === undefined) {

                    // They tell us they have a key file then give us this nonsense?
                    // Despicable!
                    // TODO: ask that they give a proper file...
                    console.error('error: no key file given');
                    return;
                }
                setupOptions.keyFile = keyFiles[0];
                this.doLogin(setupOptions);
            });
        } else {
            this.doLogin(setupOptions);
        }
    }

    doLogin(setupOptions) {
        console.log('do login');
        const setupResult = this.electronService.ipcRenderer.
            sendSync('setupSkybin', setupOptions);
        if (setupResult.wasSuccessful) {
            this.dialogRef.close();
        } else {
            console.error('Skybin setup unsuccessful. Error:', setupResult);

            // We need to tell the user what the problem was
            // and ask them for new information
            const errorReason = setupResult.errorReason;
            if (errorReason === 'homedir exists') {
                // ask for different home folder
            } else if (errorReason === 'duplicate alias') {
                // ask for a different alias
            } else if (errorReason === 'bad key file') {
                // report that the key file wasn't valid
            } else {
                // we don't know what the problem is! oh no!
            }
        }
    }

}
