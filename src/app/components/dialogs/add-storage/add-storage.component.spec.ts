import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStorageComponent } from './add-storage.component';

describe('AddStorageComponent', () => {
  let component: AddStorageComponent;
  let fixture: ComponentFixture<AddStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
