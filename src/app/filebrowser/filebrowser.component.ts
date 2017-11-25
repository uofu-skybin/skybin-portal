import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
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

  dataSource = new MatTableDataSource<File>(this.filesToDisplay);
  
  displayedColumns = ['Filename'];

  constructor() { }

  ngOnChanges() {
    console.log("Input to file browser changed!");
    this.dataSource = new MatTableDataSource<File>(this.filesToDisplay);
  }
  
  ngOnInit() {
  }

}
