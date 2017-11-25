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
export class FilebrowserComponent implements OnInit {

  // Files to display.
  @Input() filesToDisplay: File[];

  currentPath: string[] = [];
  @Output() onPathChanged = new EventEmitter<string>();
 
  constructor() { }

  ngOnChanges() {
    console.log("Input to file browser changed!");
  }
  
  ngOnInit() {
  }

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
}
