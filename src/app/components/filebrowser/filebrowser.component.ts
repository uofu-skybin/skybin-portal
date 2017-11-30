import {Component, OnInit, EventEmitter, ViewEncapsulation, Input, Output, OnChanges} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {ElectronService} from 'ngx-electron';

interface File {
    name: string;
    blocks: Object[];
    id: string;
    isDir: boolean;
}

interface FilesResponse {
    files: File[];
}

@Component({
    selector: 'app-filebrowser',
    templateUrl: './filebrowser.component.html',
    styleUrls: ['./filebrowser.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class FilebrowserComponent implements OnInit, OnChanges {

    // Files to display.
    @Input() filesToDisplay: File[];

    currentPath: string[] = [];
    @Output() onPathChanged = new EventEmitter<string>();

//  selectedFiles: File[] = [];
    @Output() onFileSelected = new EventEmitter<File[]>();

    selectedFile: any = null;

    constructor(private electronService: ElectronService) {
    }

    ngOnChanges() {
        console.log('Input to file browser changed!');
    }

    ngOnInit() {
    }

    inCurrentDirectory(file) {
        const currentDir = this.currentPath.join('/');
        const filePath = file.name.split('/');
        const fileDir = filePath.slice(0, filePath.length - 1).join('/');
        return fileDir === currentDir;
    }

    getDirsInCurrentDirectory() {
        const dirs = [];
        for (const file of this.filesToDisplay) {
            if (file.isDir && this.inCurrentDirectory(file)) {
                dirs.push(file);
            }
        }
        return dirs;
    }

    getFilesInCurrentDirectory() {
        const files = [];
        for (const file of this.filesToDisplay) {
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

    changeDir(dir) {
        this.currentPath = dir.name.split('/');
        this.onPathChanged.emit(this.currentPath.join('/'));
    }

    breadcrumbPath(dir) {
        const prevPath = this.currentPath.slice();

        this.currentPath = [];
        for (const prevDir of prevPath) {
            this.currentPath.push(prevDir);
            if (dir == prevDir) {
                break;
            }
        }
        this.onPathChanged.emit(this.currentPath.join('/'));
    }

    selectFile(e, file) {
        this.selectedFile = file;
        this.onFileSelected.emit([this.selectedFile]);

        // if (e.checked) {
        //     this.selectedFiles.push(file);
        // } else {
        //     this.selectedFiles = this.selectedFiles.filter(remainingFile => {
        //         return remainingFile.id !== file.id;
        //     });
        // }

        // this.onFileSelected.emit(this.selectedFiles);
    }

    launchMenu(event) {
        console.log('Popping up menu!');

        const menu = new this.electronService.remote.Menu();
        const menuItem = new this.electronService.remote.MenuItem({
            label: 'Delete'
        });
        menu.append(menuItem);

        event.preventDefault();
        menu.popup(this.electronService.remote.getCurrentWindow());
    }

    formatModTime(modString) {
        const date = new Date(modString);
        return date.toLocaleDateString().replace(/\//g, '-');
    }

    formatSize(size) {
        if (size > 1000000000) {
            return Math.round(size / 1000000000) + ' GB';
        }
        if (size > 1000000) {
            return Math.round(size / 1000000) + ' MB';
        }
        if (size > 1000) {
            return Math.round(size / 1000) + ' KB';
        }
        return size + ' B';
    }

}
