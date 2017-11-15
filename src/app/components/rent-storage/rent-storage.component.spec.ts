import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RentStorageComponent } from './rent-storage.component';

describe('RentStorageComponent', () => {
  let component: RentStorageComponent;
  let fixture: ComponentFixture<RentStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RentStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
