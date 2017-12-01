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

  private forms = [1];
  private formData = {1: ''};

  ngOnInit() {
  }

  addFormField() {
    this.forms.push(this.forms.length + 1);
    this.forms = this.forms.slice();
  }

  submit() {
    const users = [];
    for (const form of this.forms) {
      users.push(this.formData[form]);
    }
    this.dialogRef.close(users);
  }
}
