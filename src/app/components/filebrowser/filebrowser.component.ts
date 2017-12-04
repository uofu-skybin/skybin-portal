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
    selectedFile: SkyFile = null;
    @Output() onPathChanged = new EventEmitter<string>();
    @Output() onFileSelected = new EventEmitter<SkyFile>();
    @Output() onFileMenu = new EventEmitter<File>();


    constructor(private ref: ChangeDetectorRef) { }

    inCurrentDirectory(path: string) {
        let currentDir = this.currentPath.join('/');
        let filePath = path.split('/');
        let fileDir = filePath.slice(0, filePath.length - 1).join('/');
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
    }

    breadcrumbClicked(path: string) {
        const idx = this.currentPath.indexOf(path);
        const newPath = this.currentPath.slice(0, idx + 1);
        this.changeDir(newPath.join('/'));
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
