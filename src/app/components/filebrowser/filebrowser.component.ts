import {Component, OnInit, EventEmitter, ViewEncapsulation, Input, Output} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {SkyFile, latestVersion} from '../../models/common';
import {ChangeDetectorRef} from '@angular/core';
import {DropEvent} from 'ng-drag-drop';
import {RenterService} from '../../services/renter.service';

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

    @Input() filesToDisplay: SkyFile[];
    currentPath: string[] = [];
    selectedFile: SkyFile = null;
    @Output() onPathChanged = new EventEmitter<string>();
    @Output() onFileSelected = new EventEmitter<SkyFile>();
    @Output() onFileContextClick = new EventEmitter<MouseEvent>();


    constructor(private ref: ChangeDetectorRef,
                private renterService: RenterService) {
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

    onFileDrop(e: DropEvent, dir?: SkyFile, upDir = false) {
        const movedFile: SkyFile = e.dragData;
        const fileName = movedFile.name.split('/')[movedFile.name.split('/').length - 1];
        let newName: string;

        if (!upDir) {
            newName = `${dir.name}/${fileName}`;
        } else {
            // Moving to root directory.
            if (movedFile.name.split('/').length === 2) {
                newName = movedFile.name.split('/')[1];
            } else {
                newName = `${movedFile.name.split('/')[movedFile.name.split('/').length - 3]}/${fileName}`;
            }
        }

        // Keep appending '.copy' while a file with the same name exists in the destination directory.
        while (this.filesToDisplay.find((file: SkyFile) => {
            return file.name === newName;
        }) !== undefined) {
            newName = `${newName}.copy`;
        }

        this.renterService.renameFile(movedFile.id, newName)
            .subscribe(res => {
                const file: SkyFile = res;
                if (file.name) {
                    movedFile.name = newName;
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
}
