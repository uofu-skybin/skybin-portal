import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SkyFile } from '../../models/sky-file';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
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
        const file1 = new SkyFile(null, null, '1', false, '11-29-2017', 'file 1', 30);
        const file2 = new SkyFile(null, null, '2', false, '01-02-2015', 'file 2', 1);
        const file3= new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file4 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file5 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file6 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file7 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file8 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file9 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const file10 = new SkyFile(null, null, '1', false, '04-13-2020', 'file 3', 15);
        const dir1 = new SkyFile(null, null, '1', false, '08-08-2008', 'dir 1', 256);
        this.myFiles = [file1, file2, file3, file4, file5, file6, file7, file8, file9, file10, dir1];
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
        this.selectedFiles.forEach(file => {
            this.electronService.remote.dialog.showSaveDialog(savePath => {
                const url = 'http://127.0.0.1:8002/files/' + file.id + '/download';
                const body = {
                    destination: savePath
                };
                this.http.post(url, body).subscribe(response => {
                    console.log(response);
                }, (error) => {
                    console.error(error);
                });
            });
        });
    }
}
