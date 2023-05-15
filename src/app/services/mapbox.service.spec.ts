import { TestBed } from '@angular/core/testing';

import { MapboxService } from './mapbox.service';

describe('MapService', () => {
  let service: MapboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
