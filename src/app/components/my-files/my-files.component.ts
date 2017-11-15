import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-my-files',
    templateUrl: './my-files.component.html',
    styleUrls: ['./my-files.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class MyFilesComponent implements OnInit {
    files: string[] = ['file 1', 'file 2', 'file 3', 'file 4', 'file 5'];

    constructor() {
    }

    ngOnInit() {
        // Fetch files in order to populate the list view.
        this.loadFiles();
    }

    private loadFiles() {
        // TODO Retch files with skybin go.
    }

    downloadFile() {
        console.log('download');
    }

    uploadFile() {
        console.log('upload');
    }
}
