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
}
