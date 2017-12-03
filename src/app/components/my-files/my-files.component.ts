import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
import { SkyFile } from '../../models/sky-file';
import { LoadSkyFilesResponse } from '../../models/load-sky-files-response';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';

interface Upload {
    fileName: string;
    state: string;
}

const UPLOAD_RUNNING = 'UPLOAD_RUNNING';
const UPLOAD_DONE = 'UPLOAD_DONE';
const UPLOAD_ERROR = 'UPLOAD_ERROR';

@Component({
    selector: 'app-my-files',
    templateUrl: './my-files.component.html',
    styleUrls: ['./my-files.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class MyFilesComponent implements OnInit {
    myFiles: SkyFile[] = [];
    filteredFiles: SkyFile[] = [];
    selectedFiles: SkyFile[] = [];
    currentPath = '';
    showUploads = false;
    uploads: Upload[] = [];
    currentSearch = '';

    constructor(private http: HttpClient,
        private electronService: ElectronService,
        public dialog: MatDialog,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.loadFiles();
    }

    loadFiles() {
        this.http.get<LoadSkyFilesResponse>('http://127.0.0.1:8002/files').subscribe(response => {
            const files = response['files'];
            if (!files) {
                console.error('loadFiles: no files returned');
                console.error('response: ', response);
                return;
            }
            this.myFiles = files;
            this.onSearchChanged();
        }, (error) => {
            console.error(error);
        });
    }

    deleteFile(file) {
        this.http.delete('http://127.0.0.1:8002/files/' + file.id).subscribe(response => {
            this.myFiles = this.myFiles.filter(e => e.id !== file.id);
            this.ref.detectChanges();
        }, (error) => {
            console.error('Unable to delete file');
            console.error('Error:', error);
        });
    }

    launchFileMenu(file) {
        const menu = new this.electronService.remote.Menu();
        const deleteMenuItem = new this.electronService.remote.MenuItem({
            label: 'Delete',
            click: () => {
                this.deleteFile(file);
            }
        });
        menu.append(deleteMenuItem);
        menu.popup(this.electronService.remote.getCurrentWindow());
    }

    uploadFile() {
        this.electronService.remote.dialog.showOpenDialog(files => {
            if (!files) {
                return;
            }

            // Upload start time
            const startTime = new Date();

            files.forEach(sourcePath => {
                const dirs = sourcePath.split('/');
                const fileName = dirs[dirs.length - 1];
                let destPath = this.currentPath;
                if (destPath.length > 0) {
                    destPath += '/';
                }
                destPath += fileName;

                const upload = {
                    fileName,
                    state: UPLOAD_RUNNING,
                };
                this.uploads.unshift(upload);
                this.showUploads = true;

                const body = {
                    sourcePath,
                    destPath
                };
                this.http.post('http:/127.0.0.1:8002/files', body).subscribe((file: any) => {
                    if (file['id'] === undefined) {
                        console.error('uploadFile: request did not return file object');
                        console.error('response: ', file);
                        return;
                    }
                    upload.state = UPLOAD_DONE;
                    this.myFiles.push(file);

                    // Force change detection to re-render files and uploads.
                    // If the upload completed quickly, show the progress bar
                    // a little longer before re-rendering.
                    const endTime = new Date();
                    const elapsed = endTime.getTime() - startTime.getTime();
                    if (elapsed < 1000) {
                        setTimeout(() => this.ref.detectChanges(), 1000 - elapsed);
                    } else {
                        this.ref.detectChanges();
                    }
                }, (error) => {
                    console.error(error);
                    upload.state = 'error';
                });
            });

            // Force re-render after starting uploads to show upload progress.
            this.ref.detectChanges();
        });
    }

    newFolder() {
        const dialogRef = this.dialog.open(NewFolderDialogComponent, {
            width: '325px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result || result.length === 0) {
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

    shareFile() {
        const dialogRef = this.dialog.open(ShareDialogComponent, {});
    }

    onPathChanged(newPath) {
        this.currentPath = newPath;
        this.currentSearch = '';
        this.onSearchChanged();
    }

    onFileSelected(newFiles) {
        this.selectedFiles = newFiles;
    }

    hideUploads() {
        this.showUploads = false;
        this.uploads = this.uploads.filter(e => e.state === UPLOAD_RUNNING);
        this.ref.detectChanges();
    }

    inCurrentDirectory(file) {
        const filePath = file.name.split('/');
        const fileDir = filePath.slice(0, filePath.length - 1).join('/');
        return fileDir === this.currentPath;
    }

    getDirsInCurrentDirectory() {
        const dirs = [];
        for (const file of this.myFiles) {
            if (file.isDir && this.inCurrentDirectory(file)) {
                dirs.push(file);
            }
        }
        return dirs;
    }

    getFilesInCurrentDirectory() {
        const files = [];
        for (const file of this.myFiles) {
            if (!file.isDir && this.inCurrentDirectory(file)) {
                files.push(file);
            }
        }
        return files;
    }

    getName(file) {
        const filePath = file.name.split('/');
        return filePath[filePath.length - 1];
    }

    onSearchChanged() {
        if (this.currentSearch === '') {
            this.filteredFiles = this.myFiles;
            this.ref.detectChanges();
            return;
        }

        const searchTerms = this.currentSearch.split(' ');

        const filteredFiles = [];
        for (const dir of this.getDirsInCurrentDirectory()) {
            if (this.inCurrentDirectory(dir)) {
                const dirName = this.getName(dir);
                let containsTerms = true;
                for (const term of searchTerms) {
                    if (dirName.indexOf(term) === -1) {
                        containsTerms = false;
                    }
                }
                if (containsTerms) {
                    filteredFiles.push(dir);
                }
            }
        }

        for (const file of this.getFilesInCurrentDirectory()) {
            if (this.inCurrentDirectory(file)) {
                const fileName = this.getName(file);
                let containsTerms = true;
                for (const term of searchTerms) {
                    if (fileName.indexOf(term) === -1) {
                        containsTerms = false;
                    }
                }
                if (containsTerms) {
                    filteredFiles.push(file);
                }
            }
        }

        this.filteredFiles = filteredFiles;
        this.ref.detectChanges();
    }
}
