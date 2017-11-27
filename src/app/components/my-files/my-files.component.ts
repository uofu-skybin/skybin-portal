import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NewFolderDialogComponent } from '../../new-folder-dialog/new-folder-dialog.component';
import { ChangeDetectorRef } from '@angular/core';


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
    selectedFiles: File[] = [];
    currentPath = '';

    constructor(private http: HttpClient,
        private electronService: ElectronService,
        public dialog: MatDialog,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.loadFiles();
    }

    private loadFiles() {
        this.http.get<FilesResponse>('http://127.0.0.1:8002/files').subscribe(response => {
            const files = response['files'];
            if (!files) {
                console.error('loadFiles: no files returned');
                console.error('response: ', response);
                return;
            }
            this.myFiles = files;
        }, (error) => {
            console.error(error);
        });
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

    uploadFile() {
        this.electronService.remote.dialog.showOpenDialog(files => {
            if (!files) {
                return;
            }
            files.forEach(sourcePath => {
                const dirs = sourcePath.split('/');
                const dest = this.currentPath.split('/');
                dest.push(dirs[dirs.length - 1]);
                const destPath = dest.join('/');

                const body = {
                    sourcePath: sourcePath,
                    destPath: destPath
                };

                this.http.post('http:/127.0.0.1:8002/files', body).subscribe(response => {
                    const file = response['file'];
                    if (file === undefined) {
                        console.error('uploadFile: request returned no files');
                        console.error('response: ', response);
                        return;
                    }

                    this.myFiles.push(file);

                    // Force change detection, since angular doesn't know about the new file.
                    this.ref.detectChanges();
                }, (error) => {
                    console.error(error);
                });
            });
        });
    }

    newFolder() {
        const dialogRef = this.dialog.open(NewFolderDialogComponent, {
            width: '325px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === undefined) {
                return;
            }
            let folderPath = this.currentPath + '/' + result;
            if (folderPath.startsWith('/')) {
                folderPath = folderPath.slice(1);
            }
            const body = {
                destPath: folderPath
            };
            this.http.post('http:/127.0.0.1:8002/files', body).subscribe(response => {
                const file = response['file'];
                if (!file) {
                    console.error('newFolder: no folder returned from request');
                    this.loadFiles();
                    return;
                }
                this.myFiles.push(file);
            }, (error) => {
                console.error(error);
            });
        });
    }

    onPathChanged(newPath) {
        this.currentPath = newPath;
    }

    onFileSelected(newFiles) {
        this.selectedFiles = newFiles;
    }
}
