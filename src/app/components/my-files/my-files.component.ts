import {Component, OnInit, Inject, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ElectronService} from 'ngx-electron';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NewFolderDialogComponent } from '../../new-folder-dialog/new-folder-dialog.component';


interface File {
    name: string;
    blocks: Object[];
    id: string;
    isDir: boolean;
}

interface FilesResponse {
    files: File[];
}

@Component({
    selector: 'app-my-files',
    templateUrl: './my-files.component.html',
    styleUrls: ['./my-files.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class MyFilesComponent implements OnInit {
    myFiles: File[] = [];
    myDirs: File[] = [];

    selectedFiles: File[] = [];
    currentPath: string;

    constructor(private http: HttpClient, private electronService: ElectronService, public dialog: MatDialog) {
    }

    ngOnInit() {
        this.loadFiles();
    }

    private loadFiles() {
        console.log("Loading files!");
        this.http.get<FilesResponse>('http://127.0.0.1:8002/files').subscribe(response => {
            if (response.files) {
                let newFiles: File[] = [];
                let newDirs: File[] = [];
                for (let file of response.files) {
                    newFiles.push(file);
                }
                this.myFiles = newFiles;
            }
        });
    }

    downloadFile() {
        this.selectedFiles.forEach(file => {
            this.electronService.remote.dialog.showSaveDialog(savePath => {
                const url = 'http://127.0.0.1:8002/files/' + file.id + '/download';
                // console.log(url);
                const body = {
                    destination: savePath
                };
                this.http.post(url, body).subscribe(response => {
                    console.log(response);
                });
            });
        });
    }

    uploadFile() {
        this.electronService.remote.dialog.showOpenDialog(files => {
            if (files) {
                files.forEach(sourcePath => {
                    const dirs = sourcePath.split('/');
                    let dest = this.currentPath.split('/');
                    dest.push(dirs[dirs.length - 1]);
                    let destPath = dest.join('/');
                    const body = {
                        sourcePath: sourcePath,
                        destPath : destPath
                    };

                    this.http.post('http:/127.0.0.1:8002/files', body).subscribe(response => {
                        console.log(response);
                        this.loadFiles();
                    });
                });
            }
        });
    }

    newFolder() {
        let dialogRef = this.dialog.open(NewFolderDialogComponent, {
            width: '250px'
        });
    }

    onPathChanged(newPath) {
        this.currentPath = newPath;
    }

    onFileSelected(newFiles) {
        this.selectedFiles = newFiles;
    }
}
