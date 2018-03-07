import {Component, OnInit, EventEmitter, ViewEncapsulation, Input, Output, NgZone} from '@angular/core';
import {MatSnackBar, MatTableDataSource} from '@angular/material';
import {SkyFile, latestVersion} from '../../models/common';
import {ChangeDetectorRef} from '@angular/core';
import {DropEvent} from 'ng-drag-drop';
import {RenterService} from '../../services/renter.service';
import {NotificationComponent} from '../notification/notification.component';

interface FilesResponse {
    files: SkyFile[];
}

@Component({
    selector: 'app-filebrowser',
    templateUrl: './filebrowser.component.html',
    styleUrls: ['./filebrowser.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class FilebrowserComponent {

    @Input() allFiles: SkyFile[];
    @Input() filesToDisplay: SkyFile[];
    currentPath: string[] = [];
    selectedFile: SkyFile = null;
    @Output() onPathChanged = new EventEmitter<string>();
    @Output() onFileSelected = new EventEmitter<SkyFile>();
    @Output() onFileContextClick = new EventEmitter<MouseEvent>();
    @Output() onFolderMoved = new EventEmitter();
    @Output() onNewFolder = new EventEmitter();


    constructor(private ref: ChangeDetectorRef,
                private renterService: RenterService,
                private snackBar: MatSnackBar,
                private zone: NgZone) {
    }

    inCurrentDirectory(path: string) {
        const currentDir = this.currentPath.join('/');
        const filePath = path.split('/');
        const fileDir = filePath.slice(0, filePath.length - 1).join('/');
        return fileDir === currentDir;
    }

    getDirsInCurrentDirectory() {
        return this.filesToDisplay
            .filter(e => e.isDir)
            .filter(e => this.inCurrentDirectory(e.name));
    }

    getFilesInCurrentDirectory() {
        return this.filesToDisplay
            .filter(e => !e.isDir)
            .filter(e => this.inCurrentDirectory(e.name));
    }

    baseName(fileName: string) {
        const pathElems = fileName.split('/');
        return pathElems[pathElems.length - 1];
    }

    changeDir(path: string) {
        if (path === '') {
            this.currentPath = [];
            return;
        }
        this.currentPath = path.split('/');
        this.onPathChanged.emit(this.currentPath.join('/'));
        this.selectFile(null);
    }

    selectFile(file: SkyFile) {
        this.selectedFile = file;
        this.onFileSelected.emit(this.selectedFile);
        this.ref.detectChanges();
    }

    homeClicked() {
        this.changeDir('');
        this.onPathChanged.emit('');
        this.selectFile(null);
    }

    breadcrumbClicked(path: string) {
        const idx = this.currentPath.indexOf(path);
        const newPath = this.currentPath.slice(0, idx + 1);
        this.changeDir(newPath.join('/'));
    }

    onContextClick(event, file) {
        if (file !== this.selectedFile) {
            this.selectFile(file);
        }
        this.onFileContextClick.emit(event);
    }

    getLongestName(filter) {
        return this.filesToDisplay
            .filter(filter)
            .map(e => e.name)
            .reduce((prev, next) => next.length > prev.length ? next : prev, '');
    }

    getLongestFileName() {
        return this.getLongestName(e => !e.isDir);
    }

    getLongestFolderName() {
        return this.getLongestName(e => e.isDir);
    }

    formatModTime(modString) {
        const date = new Date(modString);
        return date.toLocaleDateString().replace(/\//g, '-');
    }

    // shim to use latestVersion() from within template
    latestVersion(file: SkyFile) {
        return latestVersion(file);
    }

    onFileDrop(e: DropEvent, dir?: any, index?) {
        const movedFile: SkyFile = e.dragData;
        const movedFileName = movedFile.name.split('/')[movedFile.name.split('/').length - 1];
        let newPathName: string;

        if (movedFile.name === dir.name) {
            const scope = this;
            this.zone.run(() => {
                scope.snackBar.openFromComponent(NotificationComponent, {
                    data: `Cannot move folder ${movedFileName} into itself!`,
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                });
            });
            return;
        }

        if (typeof dir === 'string') {
            // Do nothing if the user drags on a file on the currently scoped folder.
            if ((this.currentPath[this.currentPath.length - 1] === dir && index === this.currentPath.length - 1) ||
                (dir === '' && this.currentPath.length === 0)) {
                return;
            }
            if (dir === '') {
                newPathName = movedFileName;
            } else {
                const destDirPath = this.currentPath.slice(0, index + 1).join('/');
                newPathName = `${destDirPath}/${movedFileName}`;
            }
        } else {
            newPathName = `${dir.name}/${movedFileName}`;
        }

        // Keep appending '.copy' while a file with the same name exists in the destination directory.
        while (this.filesToDisplay.find((file: SkyFile) => {
            return file.name === newPathName;
        }) !== undefined) {
            newPathName = `${newPathName}.copy`;
        }

        this.renterService.renameFile(movedFile.id, newPathName)
            .subscribe(res => {
                const file: SkyFile = res;
                if (file.name) {
                    if (file.isDir) {
                        this.onFolderMoved.emit();
                        // this.renterService.getFiles();
                    }
                    movedFile.name = newPathName;
                }
            }, error => {
                console.log(error);
            });
    }

    moveUpDir() {
        this.currentPath.pop();
        this.onPathChanged.emit(this.currentPath.join('/'));
        this.selectFile(null);
    }

    onFileDragOver(e: any, dir: SkyFile) {
    }

    newFolder(): void {
        this.onNewFolder.emit();
    }
}
