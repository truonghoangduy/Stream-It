import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundThemeComponent } from './background-theme.component';

describe('BackgroundThemeComponent', () => {
  let component: BackgroundThemeComponent;
  let fixture: ComponentFixture<BackgroundThemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackgroundThemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
