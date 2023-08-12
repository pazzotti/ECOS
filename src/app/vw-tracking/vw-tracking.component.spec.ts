import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VwTrackingComponent } from './vw-tracking.component';

describe('VwTrackingComponent', () => {
  let component: VwTrackingComponent;
  let fixture: ComponentFixture<VwTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VwTrackingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VwTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
