import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDetailDialogComponent } from './room-detail-dialog.component';

describe('RoomDetailDialogComponent', () => {
  let component: RoomDetailDialogComponent;
  let fixture: ComponentFixture<RoomDetailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomDetailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
