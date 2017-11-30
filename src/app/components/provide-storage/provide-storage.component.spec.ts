import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideStorageComponent } from './provide-storage.component';

describe('ProvideStorageComponent', () => {
    let component: ProvideStorageComponent;
    let fixture: ComponentFixture<ProvideStorageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProvideStorageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProvideStorageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
