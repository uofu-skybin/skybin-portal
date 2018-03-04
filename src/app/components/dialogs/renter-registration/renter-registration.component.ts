import { Component, NgZone, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-login',
    templateUrl: './renter-registration.component.html',
    styleUrls: ['./renter-registration.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class RenterRegistrationComponent implements OnInit {

    private showIntro = true;
    private showRegistrationForm = false;
    private showLoginForm = false;
    private showRegistrationProgress = false;

    private userAlias = '';
    private userAliasError = '';
    private registrationError = '';
    private loginError = '';

    constructor(private dialogRef: MatDialogRef<RenterRegistrationComponent>,
        private electronService: ElectronService,
        private zone: NgZone) {
    }

    ngOnInit() {
    }

    registerClicked() {
        this.showIntro = false;
        this.showRegistrationForm = true;
    }

    importKeyClicked() {
        this.showIntro = false;
        this.showLoginForm = true;
    }

    goBackClicked() {
        this.showIntro = true;
        this.showLoginForm = false;
        this.showRegistrationForm = false;
        this.userAlias = '';
        this.userAliasError = '';
        this.registrationError = '';
        this.loginError = '';
    }

    selectFileClicked() {

        // If we were previously showing a login error, remove it now.
        this.loginError = '';

        this.electronService.remote.dialog.showOpenDialog({}, (keyFiles: string[]) => {
            this.zone.run(() => {
                if (keyFiles === undefined) {

                    // The user hit 'cancel'.
                    return;
                }
                this.electronService.ipcRenderer.once('setupRenterDone', (event, result) => {
                    this.zone.run(() => {
                        if (result.error) {
                            this.showRegistrationProgress = false;
                            this.loginError = result.error.toString();
                            return;
                        }
                        this.dialogRef.close();
                    });
                });
                const keyFile = keyFiles[0];
                const renterOptions = {
                    keyFile: keyFile,
                };
                this.electronService.ipcRenderer.send('setupRenter', renterOptions);
                this.showRegistrationProgress = true;
            });
        });
    }

    registrationDoneClicked() {

        // Remove any errors we were previously showing.
        this.registrationError = '';
        this.userAliasError = '';

        if (this.userAlias.length === 0) {
            this.userAliasError = 'You must give an alias!';
            return;
        }
        if (this.userAlias.length > 20) {
            this.userAliasError = 'Alias should be no more than 20 characters.';
            return;
        }
        if (this.userAlias.match(/^\S*$/) === null) {
            this.userAliasError = 'Alias should contain no whitespace.';
            return;
        }
        this.electronService.ipcRenderer.once('setupRenterDone', (event, result) => {
            this.zone.run(() => {
                if (result.error) {
                    this.showRegistrationProgress = false;
                    this.registrationError = result.error.toString();
                    return;
                }
                this.dialogRef.close();
            });
        });
        const renterOptions = {
            alias: this.userAlias,
        };
        this.electronService.ipcRenderer.send('setupRenter', renterOptions);
        this.showRegistrationProgress = true;
    }

}
