import { TestBed } from '@angular/core/testing';

import { FindRoomService } from './find-room.service';

describe('FindRoomService', () => {
  let service: FindRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
