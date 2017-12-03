import { Component, OnInit, EventEmitter, ViewEncapsulation, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SkyFile } from '../../models/sky-file';
import { ChangeDetectorRef } from '@angular/core';

interface FilesResponse {
    files: File[];
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
    selectedFile: any = null;
    @Output() onPathChanged = new EventEmitter<string>();
    @Output() onFileSelected = new EventEmitter<File[]>();
    @Output() onFileMenu = new EventEmitter<File>();


    constructor(private ref: ChangeDetectorRef) { }

    inCurrentDirectory(file) {
        let currentDir = this.currentPath.join('/');
        let filePath = file.name.split('/');
        let fileDir = filePath.slice(0, filePath.length - 1).join('/');
        return fileDir === currentDir;
    }

    getDirsInCurrentDirectory() {
        let dirs = [];
        for (let file of this.filesToDisplay) {
            if (file.isDir && this.inCurrentDirectory(file)) {
                dirs.push(file);
            }
        }
        return dirs;
    }

    getFilesInCurrentDirectory() {
        let files = [];
        for (let file of this.filesToDisplay) {
            if (!file.isDir && this.inCurrentDirectory(file)) {
                files.push(file);
            }
        }
        return files;
    }

    getName(file) {
        let filePath = file.name.split('/');
        return filePath[filePath.length - 1];
    }

    changeDir(dir) {
        this.currentPath = dir.name.split('/');
        this.onPathChanged.emit(this.currentPath.join('/'));
    }

    breadcrumbPath(dir) {
        let prevPath = this.currentPath.slice();

        this.currentPath = [];
        for (let prevDir of prevPath) {
            this.currentPath.push(prevDir);
            if (dir == prevDir) {
                break;
            }
        }
        this.onPathChanged.emit(this.currentPath.join('/'));
    }

    selectFile(file) {
        this.selectedFile = file;
        this.onFileSelected.emit([this.selectedFile]);
        this.ref.detectChanges();
    }

    onFileMenuContextClick(event, file) {
        if (file !== this.selectedFile) {
            this.selectFile(file);
        }
        this.onFileMenu.emit(file);
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

}
