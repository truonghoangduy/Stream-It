import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInfoDialogComponent } from './room-info-dialog.component';

describe('RoomInfoDialogComponent', () => {
  let component: RoomInfoDialogComponent;
  let fixture: ComponentFixture<RoomInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
