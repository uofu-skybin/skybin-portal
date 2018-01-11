import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureStorageComponent } from './configure-storage.component';

describe('ConfigureStorageComponent', () => {
  let component: ConfigureStorageComponent;
  let fixture: ComponentFixture<ConfigureStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
