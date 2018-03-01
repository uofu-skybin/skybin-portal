import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {ComponentFactoryResolver} from '@angular/core/src/linker/component_factory_resolver';
import {MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import {RenterService} from '../../services/renter.service';
import {NotificationComponent} from '../notification/notification.component';

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
    names = [];

    ngOnInit() {
    }

    addName() {
        if (this.currentName !== '') {
            this.names.push(this.currentName);
            this.names = this.names.slice();
            this.currentName = '';
        }
    }

    shareFile(renterAlias: string): void {
        // console.log(`sharing file ${this.data.fileId} with ${alias}`);
        const sharedFile = this.data.file;
        const sharedFileName = sharedFile.name.split('/')[sharedFile.name.split('/').length - 1];
        this.renterService.shareFile(sharedFile.id, renterAlias)
            .subscribe(res => {
                if (res.message === 'file shared') {
                    this.snackBar.openFromComponent(NotificationComponent, {
                        data: `Successfully shared ${sharedFileName} with ${renterAlias}!`,
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                    });
                }
                console.log(res);
            });
    }
}

