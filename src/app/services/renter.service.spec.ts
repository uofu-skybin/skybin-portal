import { TestBed, inject } from '@angular/core/testing';

import { RenterService } from './renter.service';

describe('RenterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RenterService]
    });
  });

  it('should be created', inject([RenterService], (service: RenterService) => {
    expect(service).toBeTruthy();
  }));
});
