import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SkyFile, latestVersion } from '../../models/common';

@Component({
    selector: 'app-view-file-details',
    templateUrl: './view-file-details.component.html',
    styleUrls: ['./view-file-details.component.css']
})
export class ViewFileDetailsComponent implements OnInit {

    file: SkyFile = null;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.file = <SkyFile>data.file;
    }

    ngOnInit() {
    }

    baseName(fileName: string) {
        const pathElems = fileName.split('/');
        return pathElems[pathElems.length - 1];
    }

    formatModTime(modString) {
        const date = new Date(modString);
        return date.toLocaleDateString().replace(/\//g, '-');
    }

    getFileLocations() {
        const locations = latestVersion(this.file).blocks.map(e => e.location);
        const addrs = locations.map(e => e.address);
        return addrs;
    }

    latestVersion(file: SkyFile) {
        return latestVersion(file);
    }
}
