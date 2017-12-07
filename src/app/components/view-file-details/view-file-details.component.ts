import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';


@Component({
  selector: 'app-view-file-details',
  templateUrl: './view-file-details.component.html',
  styleUrls: ['./view-file-details.component.css']
})
export class ViewFileDetailsComponent implements OnInit {

  file = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 
    this.file = data.file;
    console.log(this.file.blocks[0]);
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
    const locations = [];
    for (let block of this.file.blocks) {
      for (let location of block.locations) {
        if (locations.indexOf(location.address) === -1) {
          locations.push(location.address)          
        }
      }
    }
    return locations;
  }
}
