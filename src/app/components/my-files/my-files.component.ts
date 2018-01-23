import {Component, OnInit, Inject, ViewEncapsulation, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ElectronService} from 'ngx-electron';
import {MatDialog, MAT_DIALOG_DATA, MatMenuTrigger, MatSnackBar} from '@angular/material';
import {NewFolderDialogComponent} from '../dialogs/new-folder-dialog/new-folder-dialog.component';
import {ChangeDetectorRef} from '@angular/core';
import {SkyFile} from '../../models/sky-file';
import {LoadSkyFilesResponse} from '../../models/load-sky-files-response';
import {ShareDialogComponent} from '../share-dialog/share-dialog.component';
import {ViewFileDetailsComponent} from '../view-file-details/view-file-details.component';
import {Subscription} from 'rxjs/Subscription';
import {OnDestroy} from '@angular/core/src/metadata/lifecycle_hooks';
import {AddStorageComponent} from '../dialogs/add-storage/add-storage.component';
import {ConfigureStorageComponent} from '../dialogs/configure-storage/configure-storage.component';
import OpenDialogOptions = Electron.OpenDialogOptions;
import {ActivatedRoute, Router} from '@angular/router';

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

// Renter service API address
const RENTER_ADDR = 'http://127.0.0.1:8002';

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
    private renterInfo: any = {};

    constructor(private http: HttpClient,
                public electronService: ElectronService,
                public dialog: MatDialog,
                private ref: ChangeDetectorRef,
                public snackBar: MatSnackBar,
                private router: Router,
                private route: ActivatedRoute) {
        this.updateRenterInfo();
        this.loadFiles();
        // console.log(this.router.url);
    }

    ngOnInit() {
        this.updateRenterInfo();
        this.loadFiles();
        // console.log(this.router.url);
        // console.log(this.route);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(e => e.unsubscribe());
    }

    updateRenterInfo() {
        this.http.get('http://localhost:8002/info')
            .subscribe((resp: any) => {
                this.renterInfo = resp;
            }, (error: HttpErrorResponse) => {
                console.error(error);
            });
    }

    loadFiles() {
        this.http.get<LoadSkyFilesResponse>(`${RENTER_ADDR}/files`).subscribe(response => {
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
        const sub = this.http.post(`${RENTER_ADDR}/files`, body).subscribe((file: any) => {
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
        this.subscriptions.push(sub);
    }

    uploadClicked() {
        const options: OpenDialogOptions = {
            properties: ['openFile']
        };
        this.electronService.remote.dialog.showOpenDialog(options, (files: string[]) => {
            for (const file of files) {
                this.uploadFile(file);
            }
            this.ref.detectChanges();
        });

        // console.log(this.electronService.remote.dialog.showOpenDialog(
        //     {properties: ['openFile']}),
        //     (filePath: string) => {
        //         console.log(filePath);
        //         this.uploadFile(filePath);
        //         this.ref.detectChanges();
        //     });
    }

    downloadFile(file) {
        if (!file || file.isDir) {
            return;
        }
        // this.electronService.remote.dialog.showSaveDialog((destPath: string) => {
        //     if (!destPath) {
        //         return;
        //     }
        //     const download = {
        //         sourcePath: file.name,
        //         destPath,
        //         state: TRANSFER_RUNNING,
        //     };
        //     this.downloads.unshift(download);
        //     this.showDownloads = true;
        //     const url = `${RENTER_ADDR}/files/${file.id}/download`;
        //     const body = {
        //         destination: destPath
        //     };
        //     const startTime = new Date();
        //     const sub = this.http.post(url, body).subscribe(response => {
        //         download.state = TRANSFER_DONE;
        //         const endTime = new Date();
        //         const elapsedMs = endTime.getTime() - startTime.getTime();
        //         setTimeout(() => this.ref.detectChanges(), Math.max(1000 - elapsedMs, 0));
        //     }, (error) => {
        //         console.error(error);
        //         download.state = TRANSFER_ERROR;
        //         this.ref.detectChanges();
        //     });
        //     this.subscriptions.push(sub);
        //     this.ref.detectChanges();
        // });
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
            this.http.post(`${RENTER_ADDR}/files`, body).subscribe((file: any) => {
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

    addStorageClicked() {
        const storageDialog = this.dialog.open(AddStorageComponent, {
            width: '600px'
        });

        storageDialog.afterClosed().subscribe(result => {
            this.updateRenterInfo();
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
            let folderCount = 0;
            for (const otherFile of this.allFiles) {
                if (otherFile.name.indexOf(file.name) !== -1) {
                    folderCount++;
                }
            }
            if (folderCount > 1) {
                this.snackBar.open("That folder isn't empty!", null,
                    {
                        duration: 2000
                    });
                return;
            }
        }
        this.http.delete(`${RENTER_ADDR}/files/` + file.id).subscribe(response => {
            this.allFiles = this.allFiles.filter(e => e.id !== file.id);
            this.onSearchChanged();
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

    viewDetails(file) {
        const dialogRef = this.dialog.open(ViewFileDetailsComponent, {
            // width: '325px'
            data: {
                file: file
            }
        });
    }
}
