import {Component, OnInit, ViewEncapsulation, ViewChild, NgZone} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ElectronService} from 'ngx-electron';
import {MatDialog, MatMenuTrigger, MatSnackBar, MatSnackBarConfig, MatDialogRef} from '@angular/material';
import {NewFolderDialogComponent} from '../dialogs/new-folder-dialog/new-folder-dialog.component';
import {ChangeDetectorRef} from '@angular/core';
import {SkyFile, latestVersion, GetFilesResponse} from '../../models/common';
import {appConfig} from '../../models/config';
import {ShareDialogComponent} from '../share-dialog/share-dialog.component';
import {ViewFileDetailsComponent} from '../view-file-details/view-file-details.component';
import {Subscription} from 'rxjs/Subscription';
import {OnDestroy} from '@angular/core/src/metadata/lifecycle_hooks';
import {AddStorageComponent} from '../dialogs/add-storage/add-storage.component';
import {ConfigureStorageComponent} from '../dialogs/configure-storage/configure-storage.component';
import OpenDialogOptions = Electron.OpenDialogOptions;
import {NotificationComponent} from '../notification/notification.component';
import {LoginComponent} from '../login/login.component';
import {RenterService} from '../../services/renter.service';
import {ReserveStorageProgressComponent} from '../dialogs/reserve-storage-progress/reserve-storage-progress.component';

// An upload or download.
// 'sourcePath' and 'destPath' are full path names.
export class Transfer {
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
export class MyFilesComponent implements OnInit, OnDestroy {
    @ViewChild('ctxtMenuTrigger') ctxtMenuTrigger: MatMenuTrigger;
    @ViewChild('ctxtMenuTriggerFolder') ctxtMenuTriggerFolder: MatMenuTrigger;

    allFiles: SkyFile[] = [];
    filteredFiles: SkyFile[] = [];
    selectedFile: SkyFile = null;
    currentPath = '';
    uploads: Transfer[] = [];
    downloads: Transfer[] = [];
    showUploads = false;
    showDownloads = false;
    currentSearch = '';
    subscriptions: Subscription[] = [];
    // Renter info object returned from the renter service.
    renterInfo: any = {};

    // TODO: These will move if the upload/dl progress view goes into the parent component.
    // Upload progress variables.
    uploadBodyVisible = true;
    downloadBodyVisible = true;
    completedUploads = 0;
    uploadInProgress = false;

    constructor(private http: HttpClient,
                public electronService: ElectronService,
                public dialog: MatDialog,
                private ref: ChangeDetectorRef,
                public snackBar: MatSnackBar,
                public zone: NgZone,
                private renterService: RenterService) {

        // Check if this is the first time launching the app.
        // I do this in the constructor instead of ngOnInit()
        // due to an angular bug: https://github.com/angular/material2/issues/5268
        const isSkybinSetup = this.electronService.ipcRenderer.sendSync('isSkybinSetup');
        if (isSkybinSetup) {
            this.getRenterInfo();
            this.getFiles();
        } else {

            // First time setup. Show the setup dialog.
            console.log('showing setup dialog');
            const loginDialog = this.dialog.open(LoginComponent, {
                disableClose: true,
            });
            loginDialog.afterClosed().subscribe(() => {
                this.getRenterInfo();
                this.getFiles();
            });
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(e => e.unsubscribe());
    }

    getRenterInfo() {
        this.renterService.getRenterInfo()
            .subscribe(res => {
                this.renterInfo = res;
            });
    }

    getFiles() {
        this.renterService.getFiles()
            .subscribe(res => {
                this.allFiles = res.files;
                this.filteredFiles = res.files;
            });
    }

    addStorageClicked() {
        const storageDialog = this.dialog.open(AddStorageComponent, {
            width: '600px',
            data: {
                renterInfo: this.renterInfo,
            },
        });

        storageDialog.afterClosed().subscribe(result => {
            const storageRequested = storageDialog.componentInstance.storageRequested;
            if (!storageRequested) {
                return;
            }
            const progressDialog = this.dialog.open(ReserveStorageProgressComponent, {
                width: '600px'
            });
            const params = {
                amount: storageRequested,
            };
            const startTime = new Date();
            this.renterService.reserveStorage(storageRequested)
                .subscribe(res => {
                    const endTime = new Date();
                    const elapsedMs = endTime.getTime() - startTime.getTime();
                    setTimeout(() => {
                        progressDialog.close();
                        this.getRenterInfo();
                    }, Math.max(3000 - elapsedMs, 0));
                });
        });
    }

    uploadFile(sourcePath) {
        const baseName = this.baseName(sourcePath);
        let destPath = this.currentPath;
        if (destPath.length > 0) {
            destPath += '/';
        }
        destPath += baseName;

        // Make sure there are no files with the given name.
        while (this.allFiles.some(e => e.name === destPath)) {
            destPath += '.copy';
        }

        const upload = {
            sourcePath,
            destPath,
            state: TRANSFER_RUNNING,
        };
        this.uploads.unshift(upload);
        this.showUploads = true;

        this.uploadInProgress = true;

        const body = {
            sourcePath,
            destPath,
        };
        const startTime = new Date();
        this.zone.run(() => {
            this.renterService.uploadFile(sourcePath, body)
                .subscribe(file => {
                    if (file.id) {
                        const fakeDelay = 1500;
                        /* ms */
                        this.allFiles.push(file);
                        const endTime = new Date();
                        const elapsedMs = endTime.getTime() - startTime.getTime();
                        const uploadTime = Math.max(elapsedMs, fakeDelay);
                        this.getRenterInfo();
                        setTimeout(() => {
                            upload.state = TRANSFER_DONE;
                            this.completedUploads++;
                            this.uploadInProgress = false;
                        }, uploadTime);
                    } else {
                        upload.state = TRANSFER_ERROR;
                        this.uploadInProgress = false;
                    }
                });
        });
    }

    uploadClicked() {
        const options: OpenDialogOptions = {
            properties: [
                'openFile',
                'multiSelections'
            ],
        };
        this.electronService.remote.dialog.showOpenDialog(options, (files: string[]) => {
            if (!files) return;
            files.forEach(e => this.uploadFile(e));
            this.getRenterInfo();
            this.ref.detectChanges();
        });
    }

    // Triggered when a file has been right clicked in the filebrowser.
    onContextClick(event: MouseEvent) {
        if (!this.selectedFile.isDir) {
            this.ctxtMenuTrigger.openMenu();
        } else {
            this.ctxtMenuTriggerFolder.openMenu();
        }

        // Position the file context menu over the selected file
        const elem: any = document.querySelector('.mat-menu-panel');
        if (!elem) {
            console.error('Unable to select context menu');
            return;
        }

        const left = event.clientX;
        const top = Math.min(event.clientY,
            window.innerHeight - elem.clientHeight - 10);

        elem.style.position = 'fixed';
        elem.style.left = `${left}px`;
        elem.style.top = `${top}px`;
    }

    // Returns the last element of a file path.
    // e.g. "/users/a.txt" -> "a.txt"
    baseName(fileName: string) {
        const pathElems = fileName.split('/');
        return pathElems[pathElems.length - 1];
    }

    showErrorNotification(message) {
        const scope = this;
        this.zone.run(() => {
            scope.snackBar.openFromComponent(NotificationComponent, {
                data: message,
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });
        });
    }

    downloadFile(file) {
        if (!file || file.isDir) {
            return;
        }
        this.electronService.remote.dialog.showSaveDialog({defaultPath: '*/' + file.name}, (destPath: string) => {
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
            const url = `${appConfig['renterAddress']}/files/download`;
            const body = {
                fileId: file.id,
                destPath
            };
            const startTime = new Date();
            const sub = this.http.post(url, body).subscribe(response => {
                download.state = TRANSFER_DONE;
                const endTime = new Date();
                const elapsedMs = endTime.getTime() - startTime.getTime();
                setTimeout(() => this.ref.detectChanges(), Math.max(1000 - elapsedMs, 0));
            }, (error) => {
                console.error(error);
                let errorMessage = `Unable to download ${download.sourcePath}.`;
                if (error.error && error.error.error) {
                    errorMessage += ` Error: ${error.error.error}`;
                }
                this.showErrorNotification(errorMessage);
                download.state = TRANSFER_ERROR;
                this.ref.detectChanges();
            });
            this.subscriptions.push(sub);
            this.ref.detectChanges();
        });
    }

    downloadClicked() {
        if (!this.selectedFile) {
            return;
        }
        this.downloadFile(this.selectedFile);
    }

    showFinishedDownload(download: Transfer) {
        const ok = this.electronService.shell.showItemInFolder(download.destPath);
        if (!ok) {
            console.error('Unable to show downloaded file. Download:', download);
        }
    }

    newFolderClicked() {
        const dialogRef = this.dialog.open(NewFolderDialogComponent, {
            width: '325px'
        });

        this.zone.run(() => {
            dialogRef.afterClosed().subscribe(result => {
                if (!result || result.length === 0) {
                    return;
                }
                let folderPath = this.currentPath + '/' + result;
                if (folderPath.startsWith('/')) {
                    folderPath = folderPath.slice(1);
                }
                if (this.allFiles.some(e => e.name === folderPath)) {
                    this.showErrorNotification(`"${result}" already exists`);
                    return;
                }
                const body = {
                    name: folderPath
                };
                this.http.post(`${appConfig['renterAddress']}/files/create-folder`, body).subscribe((file: any) => {
                    if (!file['id']) {
                        console.error('newFolder: no folder returned from request');
                        console.log('response:', file);
                        this.getFiles();
                        return;
                    }
                    this.getFiles();
                    // this.allFiles.push(file);
                    // this.filteredFiles.push(file);
                }, (error) => {
                    console.error(error);
                });
            });
        });
    }


    configureStorageClicked() {
        const storageDialog = this.dialog.open(ConfigureStorageComponent, {
            width: '600px'
        });
    }

    shareClicked() {
        if (!this.selectedFile) {
            return;
        }
        const dialogRef = this.dialog.open(ShareDialogComponent, {});
    }

    deleteFile(file) {
        if (!file) {
            return;
        }
        // If the file is a directory, make sure it is empty
        if (file.isDir) {
            const hasChild = this.allFiles.some(e =>
                e.name.startsWith(file.name) && e.id !== file.id);
            if (hasChild) {
                this.showErrorNotification('That folder isn\'t empty!');
                return;
            }
        }
        const body = {
            fileId: file.id,
        };
        this.zone.run(() => {
            this.http.post(`${appConfig['renterAddress']}/files/remove`, body).subscribe(response => {
                this.allFiles = this.allFiles.filter(e => e.id !== file.id);
                // this.filteredFiles = this.filteredFiles.filter(e => e.id !== file.id);
                this.onSearchChanged();
                this.getRenterInfo();
                // this.ref.detectChanges();
                this.showErrorNotification(`${file.name} has been deleted!`);
            }, (error) => {
                console.error('Unable to delete file');
                console.error('Error:', error);
            });
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

    onFolderMoved() {
        // this.allFiles = [];
        // this.filteredFiles = [];
        this.getFiles();
    }

    hideUploads() {
        this.showUploads = false;
        this.uploads = this.uploads.filter(e => e.state === TRANSFER_RUNNING);
        this.completedUploads = 0;
        this.uploadBodyVisible = true;
        this.ref.detectChanges();
    }

    toggleUploadBody() {
        this.uploadBodyVisible = !this.uploadBodyVisible;
    }

    hideDownloads() {
        this.showDownloads = false;
        this.downloads = this.downloads.filter(e => e.state === TRANSFER_RUNNING);
        this.downloadBodyVisible = true;
        this.ref.detectChanges();
    }

    toggleDownloadBody() {
        this.downloadBodyVisible = !this.downloadBodyVisible;
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
            // this.filteredFiles = [];
            // for (const file of this.allFiles) {
            //     this.filteredFiles.push(file);
            // }
            // this.ref.detectChanges();
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
        // this.ref.detectChanges();
    }

    viewDetails(file) {
        const dialogRef = this.dialog.open(ViewFileDetailsComponent, {
            // width: '325px'
            data: {
                file: file
            }
        });
    }

    onDrop(event) {
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
        event.preventDefault();

        const dt = event.dataTransfer;
        if (dt.items) {
            for (let i = 0; i < dt.items.length; i++) {
                if (dt.items[i].kind === 'file') {
                    const file = dt.items[i].getAsFile();
                    this.uploadFile(file.path);
                }
            }
        }
    }

    onDragOver(e) {
        e.preventDefault();
    }

}
