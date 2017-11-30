import { Component, OnInit, EventEmitter, ViewEncapsulation, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

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
export class FilebrowserComponent {

  // Files to display.
  @Input() filesToDisplay: File[];
  currentPath: string[] = [];
  selectedFile: any = null;
  @Output() onPathChanged = new EventEmitter<string>();
  @Output() onFileSelected = new EventEmitter<File[]>();
  @Output() onFileMenu = new EventEmitter<File>();


  constructor() { }

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

  selectFile(e, file) {
    this.selectedFile = file;
    this.onFileSelected.emit([this.selectedFile]);
  }

  onFileMenuContextClick(event, file) {
    event.preventDefault();
    this.onFileMenu.emit(file);
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