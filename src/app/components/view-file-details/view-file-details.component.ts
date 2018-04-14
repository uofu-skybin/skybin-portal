import {Component, OnInit, Inject, Output, EventEmitter} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {SkyFile, latestVersion, Version} from '../../models/common';
import {RenterService} from '../../services/renter.service';

@Component({
    selector: 'app-view-file-details',
    templateUrl: './view-file-details.component.html',
    styleUrls: ['./view-file-details.component.css']
})
export class ViewFileDetailsComponent implements OnInit {

    file: SkyFile = null;
    @Output() onDownloadVersion = new EventEmitter<any[]>();

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                private renterService: RenterService) {
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

    getDateString(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    latestVersion(file: SkyFile) {
        return latestVersion(file);
    }

    /**
     * Calculate total storage in bytes of a file including all versions.
     * @param {SkyFile} file
     */
    getTotalFileSize(file: SkyFile): number {
        let size = 0;
        for (const version of file.versions) {
            size += version.size;
        }
        return size;
    }

    downloadVersion(file: SkyFile, version: Version) {
        if (!file) {
            return;
        }
        this.onDownloadVersion.emit([file, version.num]);
    }

    deleteFile(file: SkyFile, version: Version) {
        this.latestVersion(file);
        this.renterService.deleteFile(file.id, version.num)
            .subscribe(res => {
                console.log(res);
                this.file.versions = this.file.versions.filter(ver => {
                    return ver.num !== version.num;
                });
            });
    }
}

