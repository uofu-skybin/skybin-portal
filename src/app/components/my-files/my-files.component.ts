import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';
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
    selector: 'app-my-files',
    templateUrl: './my-files.component.html',
    styleUrls: ['./my-files.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyFilesComponent implements OnInit {
    myFiles: File[] = [];
    myDirs: File[] = [];

    selectedFiles: File[] = [];
    currentPath: string[] = [];

    constructor(private http: HttpClient, private electronService: ElectronService) {
    }

    ngOnInit() {
        this.loadFiles();
    }

    private loadFiles() {
        this.http.get<FilesResponse>('http://127.0.0.1:8002/files').subscribe(response => {
            if (response.files) {
                for (let file of response.files) {
                    if (file.isDir) {
                        this.myDirs.push(file);
                    } else {
                        this.myFiles.push(file);
                    }
                }
            }
        });
    }

    downloadFile() {
        this.selectedFiles.forEach(file => {
            this.electronService.remote.dialog.showSaveDialog(savePath => {
                const url = 'http://127.0.0.1:8002/files/' + file.id + '/download';
                // console.log(url);
                const body = {
                    destination: savePath
                };
                this.http.post(url, body).subscribe(response => {
                    console.log(response);
                });
            });
        });
    }

    uploadFile() {
        this.electronService.remote.dialog.showOpenDialog(files => {
            if (files) {
                files.forEach(sourcePath => {
                    const dirs = sourcePath.split('/');
                    let dest = this.currentPath.slice();
                    dest.push(dirs[dirs.length - 1]);
                    let destPath = dest.join('/');
                    const body = {
                        sourcePath: sourcePath,
                        destPath : destPath
                    };

                    this.http.post('http:/127.0.0.1:8002/files', body).subscribe(response => {
                        console.log(response);
                    });
                });
            }
        });
    }

    selectFile(e, file) {
        // console.log(e);
        if (e.checked) {
            this.selectedFiles.push(file);
        } else {
            this.selectedFiles = this.selectedFiles.filter(remainingFile => {
                return remainingFile.id !== file.id;
            });
        }
    }

    changeDir(dir) {
        this.currentPath = dir.name.split('/');
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
    }

    getFilesInCurrentDirectory(currentPath, files) {
        let currentDir = currentPath.join('/');

        let returnFiles: File[] = [];
        for (let file of files) {
            let filePath = file.name.split('/');
            let fileDir = filePath.slice(0, filePath.length - 1).join('/');
            if (fileDir === currentDir) {
                returnFiles.push(file);
            }
        }

        return returnFiles;
    }

    getName(file) {
        let filePath = file.name.split('/');
        return filePath[filePath.length - 1];
    }
}
