import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {RenterService} from '../../../services/renter.service';

@Component({
    selector: 'app-delete-folder',
    templateUrl: './delete-folder.component.html',
    styleUrls: ['./delete-folder.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DeleteFolderComponent implements OnInit {

    folderName = '';
    numberOfChildren = 0;

    constructor(public dialogRef: MatDialogRef<DeleteFolderComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private renterService: RenterService) {
        this.folderName = data.folderName;
        this.numberOfChildren = data.numberOfChildren;
    }

    ngOnInit() {
    }

    deleteFolder() {
        this.dialogRef.close(true);
    }

}
