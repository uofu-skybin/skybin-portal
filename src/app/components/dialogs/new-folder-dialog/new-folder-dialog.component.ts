import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-new-folder-dialog',
    templateUrl: './new-folder-dialog.component.html',
    styleUrls: ['./new-folder-dialog.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class NewFolderDialogComponent {

    private name = '';
    private errorMessage = '';

    constructor(public dialogRef: MatDialogRef<NewFolderDialogComponent>) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        if (this.name.length === 0) {
            this.errorMessage = 'Must give folder name';
            return;
        }
        if (this.name.match(/^[0-9a-zA-Z\ \-\_]+$/) === null) {
            this.errorMessage = 'Invalid name';
            return;
        }
        this.dialogRef.close(this.name);
    }

}
