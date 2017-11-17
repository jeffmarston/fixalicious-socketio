import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionNavComponent } from './session-nav.component';

describe('SessionNavComponent', () => {
  let component: SessionNavComponent;
  let fixture: ComponentFixture<SessionNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
