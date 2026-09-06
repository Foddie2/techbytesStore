import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackOrderComponent } from './track-order.component';

describe('TrackOrder', () => {
  let component: TrackOrderComponent;
  let fixture: ComponentFixture<TrackOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackOrderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackOrderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
