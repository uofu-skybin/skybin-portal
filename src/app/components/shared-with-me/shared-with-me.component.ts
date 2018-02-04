import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SkyFile } from '../../models/common';
import { NewFolderDialogComponent } from '../dialogs/new-folder-dialog/new-folder-dialog.component';
import { MatDialog } from '@angular/material';
import { ElectronService } from 'ngx-electron';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-shared-with-me',
    templateUrl: './shared-with-me.component.html',
    styleUrls: ['./shared-with-me.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SharedWithMeComponent implements OnInit {
    myFiles: SkyFile[] = [];
    selectedFiles: SkyFile[] = [];
    currentPath = '';

    constructor(private http: HttpClient,
        private electronService: ElectronService,
        public dialog: MatDialog,
        private ref: ChangeDetectorRef) {
        this.myFiles = [];
    }

    ngOnInit() {
    }

    onPathChanged(newPath) {
        this.currentPath = newPath;
    }

    onFileSelected(newFiles) {
        this.selectedFiles = newFiles;
    }

    downloadFile() {
        console.error('shared-with-me: downloadFile() not implemented');
    }
}
