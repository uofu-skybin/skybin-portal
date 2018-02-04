import { Component, OnInit, EventEmitter, ViewEncapsulation, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SkyFile, latestVersion } from '../../models/common';
import { ChangeDetectorRef } from '@angular/core';

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


    constructor(private ref: ChangeDetectorRef) { }

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

}
