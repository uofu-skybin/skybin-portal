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

  private alias = '';
  private errorMessage = '';

  constructor(public dialogRef: MatDialogRef<ShareDialogComponent>) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
      if (this.alias.length === 0) {
          this.errorMessage = 'Must supply renter alias';
          return;
      }
      this.dialogRef.close(this.alias);
  }
}
