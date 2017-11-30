import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';


@Component({
    selector: 'app-new-folder-dialog',
    templateUrl: './new-folder-dialog.component.html',
    styleUrls: ['./new-folder-dialog.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class NewFolderDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<NewFolderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    name: string = '';

    ngOnInit() {

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        // TODO: have this make sure the name is not empty and show an error if it is.
        this.dialogRef.close(this.name);
    }

}
