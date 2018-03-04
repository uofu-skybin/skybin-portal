import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {ComponentFactoryResolver} from '@angular/core/src/linker/component_factory_resolver';
import {MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import {RenterService} from '../../services/renter.service';
import {NotificationComponent} from '../notification/notification.component';
import {SkyFile} from '../../models/common';

@Component({
    selector: 'app-share-dialog',
    templateUrl: './share-dialog.component.html',
    styleUrls: ['./share-dialog.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ShareDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<ShareDialogComponent>,
                private renterService: RenterService,
                private snackBar: MatSnackBar,
                @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    currentName = '';
    sharedFile: SkyFile = null;
    errorMessage = '';

    ngOnInit() {
        this.sharedFile = this.data.file;
    }

    shareFile(renterAlias: string): void {
        if (renterAlias.length === 0) {
            this.errorMessage = 'Must give user alias.';
            return;
        }
        const pathComponents = this.sharedFile.name.split('/');
        const sharedFileName = pathComponents[pathComponents.length - 1];
        this.renterService.shareFile(this.sharedFile.id, renterAlias)
            .subscribe(res => {
                if (res.message === 'file shared') {
                    this.snackBar.openFromComponent(NotificationComponent, {
                        data: `Successfully shared ${sharedFileName} with ${renterAlias}!`,
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                    });
                }
                this.dialogRef.close();
            });
    }
}

