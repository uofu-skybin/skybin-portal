import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-rename-file-dialog',
    templateUrl: './rename-file-dialog.component.html',
    styleUrls: ['./rename-file-dialog.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class RenameFileDialogComponent implements OnInit {

    private name = '';
    private errorMessage = '';

    constructor(public dialogRef: MatDialogRef<RenameFileDialogComponent>) {
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        if (this.name.length === 0) {
            this.errorMessage = 'New file name cannot be blank.';
            return;
        }
        if (this.name.match(/^[0-9a-zA-Z\ \-\_\.]+$/) === null) {
            this.errorMessage = 'Invalid name';
            return;
        }
        this.dialogRef.close(this.name);
    }
}
