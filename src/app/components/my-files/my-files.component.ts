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

// An upload or download.
// 'sourcePath' and 'destPath' are full path names.
interface Transfer {
    sourcePath: string;
    destPath: string;
    state: string;
}

// Transfer states
const TRANSFER_RUNNING = 'TRANSFER_RUNNING';
const TRANSFER_DONE = 'TRANSFER_DONE';
const TRANSFER_ERROR = 'TRANSFER_ERROR';

@Component({
    selector: 'app-my-files',
    templateUrl: './my-files.component.html',
    styleUrls: ['./my-files.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class MyFilesComponent implements OnInit {
    allFiles: SkyFile[] = [];
    filteredFiles: SkyFile[] = [];
    selectedFile: SkyFile = null;
    currentPath = '';
    uploads: Transfer[] = [];
    downloads: Transfer[] = [];
    showUploads = false;
    showDownloads = false;
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
            this.allFiles = files;
            this.onSearchChanged();
        }, (error) => {
            console.error(error);
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

    // Returns the last element of a file path.
    // e.g. "/users/a.txt" -> "a.txt"
    baseName(fileName: string) {
        const pathElems = fileName.split('/');
        return pathElems[pathElems.length - 1];
    }

    uploadFile(sourcePath) {
        const baseName = this.baseName(sourcePath);
        let destPath = this.currentPath;
        if (destPath.length > 0) {
            destPath += '/';
        }
        destPath += baseName;

        const upload = {
            sourcePath,
            destPath,
            state: TRANSFER_RUNNING,
        };
        this.uploads.unshift(upload);
        this.showUploads = true;

        const body = {
            sourcePath,
            destPath,
        };
        const startTime = new Date();
        this.http.post('http:/127.0.0.1:8002/files', body).subscribe((file: any) => {
            if (file['id'] === undefined) {
                console.error('uploadFile: request did not return file object');
                console.error('response: ', file);
                return;
            }
            upload.state = TRANSFER_DONE;
            this.allFiles.push(file);

            // Force change detection to re-render files and uploads.
            // If the upload completed quickly, show the progress bar
            // a little longer before re-rendering.
            const endTime = new Date();
            const elapsedMs = endTime.getTime() - startTime.getTime();
            setTimeout(() => this.ref.detectChanges(), Math.max(1000 - elapsedMs, 0));
        }, (error) => {
            console.error(error);
            upload.state = TRANSFER_ERROR;
        });
    }

    uploadClicked() {
        this.electronService.remote.dialog.showOpenDialog(files => {
            if (!files) {
                return;
            }
            files.forEach(sourcePath => {
                this.uploadFile(sourcePath);
            });
            this.ref.detectChanges();
        });
    }

    downloadFile(file) {
        this.electronService.remote.dialog.showSaveDialog((destPath: string) => {
            if (!destPath) {
                return;
            }
            const download = {
                sourcePath: file.name,
                destPath,
                state: TRANSFER_RUNNING,
            };
            this.downloads.unshift(download);
            this.showDownloads = true;
            const url = `http://127.0.0.1:8002/files/${file.id}/download`;
            const body = {
                destination: destPath
            };
            const startTime = new Date();
            this.http.post(url, body).subscribe(response => {
                download.state = TRANSFER_DONE;
                const endTime = new Date();
                const elapsedMs = endTime.getTime() - startTime.getTime();
                setTimeout(() => this.ref.detectChanges(), Math.max(1000 - elapsedMs, 0));
           }, (error) => {
                console.error(error);
                download.state = TRANSFER_ERROR;
                this.ref.detectChanges();
            });
            this.ref.detectChanges();
        });
    }

    downloadClicked() {
        if (!this.selectedFile) {
            return;
        }
        this.downloadFile(this.selectedFile);
    }

    newFolderClicked() {
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
            this.http.post('http:/127.0.0.1:8002/files', body).subscribe((file: any) => {
                if (!file['id']) {
                    console.error('newFolder: no folder returned from request');
                    console.log('response:', file);
                    this.loadFiles();
                    return;
                }
                this.allFiles.push(file);
            }, (error) => {
                console.error(error);
            });
        });
    }

    shareClicked() {
        if (!this.selectedFile) {
            return;
        }
        const dialogRef = this.dialog.open(ShareDialogComponent, {});
    }

    deleteFile(file) {
        this.http.delete('http://127.0.0.1:8002/files/' + file.id).subscribe(response => {
            this.allFiles = this.allFiles.filter(e => e.id !== file.id);
            this.ref.detectChanges();
        }, (error) => {
            console.error('Unable to delete file');
            console.error('Error:', error);
        });
    }

    onPathChanged(newPath) {
        this.currentPath = newPath;
        this.currentSearch = '';
        this.onSearchChanged();
    }

    onFileSelected(file: SkyFile) {
        this.selectedFile = file;
    }

    hideUploads() {
        this.showUploads = false;
        this.uploads = this.uploads.filter(e => e.state === TRANSFER_RUNNING);
        this.ref.detectChanges();
    }

    hideDownloads() {
        this.showDownloads = false;
        this.downloads = this.downloads.filter(e => e.state === TRANSFER_RUNNING);
        this.ref.detectChanges();
    }

    inCurrentDirectory(file) {
        const filePath = file.name.split('/');
        const fileDir = filePath.slice(0, filePath.length - 1).join('/');
        return fileDir === this.currentPath;
    }

    getDirsInCurrentDirectory() {
        const dirs = [];
        for (const file of this.allFiles) {
            if (file.isDir && this.inCurrentDirectory(file)) {
                dirs.push(file);
            }
        }
        return dirs;
    }

    getFilesInCurrentDirectory() {
        const files = [];
        for (const file of this.allFiles) {
            if (!file.isDir && this.inCurrentDirectory(file)) {
                files.push(file);
            }
        }
        return files;
    }

    onSearchChanged() {
        if (this.currentSearch === '') {
            this.filteredFiles = this.allFiles;
            this.ref.detectChanges();
            return;
        }

        const searchTerms = this.currentSearch.split(' ');

        const filteredFiles = [];
        for (const dir of this.getDirsInCurrentDirectory()) {
            if (this.inCurrentDirectory(dir)) {
                const dirName = this.baseName(dir.name);
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
                const fileName = this.baseName(file.name);
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
