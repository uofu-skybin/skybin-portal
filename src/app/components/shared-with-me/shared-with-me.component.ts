import { ChangeDetectorRef, Component, ViewChild, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { NewFolderDialogComponent } from '../dialogs/new-folder-dialog/new-folder-dialog.component';
import { MatDialog, MatSnackBar, MatMenuTrigger } from '@angular/material';
import { ElectronService } from 'ngx-electron';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { RenterService } from '../../services/renter.service';
import { SkyFile, latestVersion, GetFilesResponse } from '../../models/common';
import { appConfig } from '../../models/config';
import { NotificationComponent } from '../notification/notification.component';

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
    selector: 'app-shared-with-me',
    templateUrl: './shared-with-me.component.html',
    styleUrls: ['./shared-with-me.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SharedWithMeComponent implements OnInit {
    @ViewChild('ctxtMenuTrigger') ctxtMenuTrigger: MatMenuTrigger;
    @ViewChild('ctxtMenuTriggerFolder') ctxtMenuTriggerFolder: MatMenuTrigger;

    allFiles: SkyFile[] = [];
    filteredFiles: SkyFile[] = [];
    selectedFile: SkyFile = null;
    currentPath = '';
    downloads: Transfer[] = [];
    showDownloads = false;
    currentSearch = '';
    subscriptions: Subscription[] = [];
    // Renter info object returned from the renter service.
    renterInfo: any = {};

    constructor(private http: HttpClient,
        private electronService: ElectronService,
        public dialog: MatDialog,
        private ref: ChangeDetectorRef,
        public zone: NgZone,
        public snackBar: MatSnackBar,
        private renterService: RenterService) {
        this.getFiles();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(e => e.unsubscribe());
    }

    onPathChanged(newPath) {
        this.currentPath = newPath;
        this.currentSearch = '';
        this.onSearchChanged();
    }

    onFileSelected(file: SkyFile) {
        this.selectedFile = file;
    }

    getFiles() {
        this.http.get<GetFilesResponse>(`${appConfig['renterAddress']}/files/shared`).subscribe((resp) => {
            const files = resp['files'];
            if (!files) {
                console.error('getFiles: no files returned');
                console.error('response:', resp);
                return;
            }
            this.allFiles = files;
            this.filteredFiles = files;
        }, (error) => {
            console.error('Error fetching files. Error:', error);
            this.showErrorNotification('Error fetching files');
        });
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

    downloadFile(file) {
        if (!file || file.isDir) {
            return;
        }
        this.electronService.remote.dialog.showSaveDialog({ defaultPath: "*/" + file.name }, (destPath: string) => {
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

    deleteFile(file) {
        if (!file) {
            return;
        }
        // If the file is a directory, make sure it is empty
        // if (file.isDir) {
        //     const hasChild = this.allFiles.some(e =>
        //         e.name.startsWith(file.name) && e.id !== file.id);
        //     if (hasChild) {
        //         this.showErrorNotification('That folder isn\'t empty!');
        //         return;
        //     }
        // }
        // const body = {
        //     fileId: file.id,
        // };
        // this.http.post(`${appConfig['renterAddress']}/files/remove`, body).subscribe(response => {
        //     this.allFiles = this.allFiles.filter(e => e.id !== file.id);
        //     this.onSearchChanged();
        //     this.getRenterInfo();
        //     this.ref.detectChanges();
        // }, (error) => {
        //     console.error('Unable to delete file');
        //     console.error('Error:', error);
        // });
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

    baseName(fileName: string) {
        const pathElems = fileName.split('/');
        return pathElems[pathElems.length - 1];
    }
}
