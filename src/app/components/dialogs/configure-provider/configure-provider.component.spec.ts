import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureProviderComponent } from './configure-provider.component';

describe('ConfigureProviderComponent', () => {
  let component: ConfigureProviderComponent;
  let fixture: ComponentFixture<ConfigureProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

