import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ElectronService} from 'ngx-electron';

interface File {
    name: string,
    blocks: Object[],
    id: string
}

interface filesResponse {
    files: File[]
}

@Component({
    selector: 'app-my-files',
    templateUrl: './my-files.component.html',
    styleUrls: ['./my-files.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyFilesComponent implements OnInit {
    private myFiles: File[] = [];
    private selectedFiles: File[] = [];

    constructor(private http: HttpClient, private electronService: ElectronService) {
    }

    ngOnInit() {
        this.loadFiles();
    }

    private loadFiles() {
        this.http.get<filesResponse>('http://127.0.0.1:8002/files').subscribe(response => {
            if (response.files) {
                response.files.forEach(file => {
                    this.myFiles.push(file);
                });
            }
        });
        console.log(this.myFiles);
    }

    downloadFile() {
        this.selectedFiles.forEach(file => {
            this.electronService.remote.dialog.showSaveDialog(savePath => {
                let url = 'http://127.0.0.1:8002/files/' + file.id + '/download';
                // console.log(url);
                let body = {
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
            files.forEach(sourcePath => {
                let dirs = sourcePath.split('/');
                let destPath = dirs[dirs.length - 1];
                let body = {
                    sourcePath: sourcePath,
                    destPath : destPath
                };

                this.http.post('http:/127.0.0.1:8002/files', body).subscribe(response => {
                    console.log(response);
                });
            });
        });
    }

    selectFile(e, file) {
        // console.log(e, file);
        if (e.srcElement.checked) {
            this.selectedFiles.push(file);
        } else {
            this.selectedFiles = this.selectedFiles.filter(remainingFile => {
                return remainingFile.id != file.id;
            });
        }
        console.log(this.selectedFiles);
    }
}
