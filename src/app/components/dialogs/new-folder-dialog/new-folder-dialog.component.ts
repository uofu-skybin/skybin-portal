import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-new-folder-dialog',
    templateUrl: './new-folder-dialog.component.html',
    styleUrls: ['./new-folder-dialog.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class NewFolderDialogComponent {

    name = '';

    constructor(public dialogRef: MatDialogRef<NewFolderDialogComponent>) {

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        // TODO: have this make sure the name is not empty and show an error if it is.
        this.dialogRef.close(this.name);
    }

}
