import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFileDetailsComponent } from './view-file-details.component';

describe('ViewFileDetailsComponent', () => {
  let component: ViewFileDetailsComponent;
  let fixture: ComponentFixture<ViewFileDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFileDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
