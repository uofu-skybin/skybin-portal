import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core/src/linker/component_factory_resolver';
import { MatDialogRef, MatDialog } from '@angular/material';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ShareDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ShareDialogComponent>
  ) { }

  private currentName = '';
  private names = [];

  ngOnInit() {
  }

  addName() {
    if (this.currentName !== '') {
      this.names.push(this.currentName);
      this.names = this.names.slice();
      this.currentName = '';
    }
  }
}
