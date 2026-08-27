import { ComponentFixture, TestBed } from '@angular/core/testing';

declare const require: (moduleName: string) => { HomeComponent: any };

const HomeComponent = require('./home.component').HomeComponent;

describe('HomeComponent', () => {
  let component: InstanceType<typeof HomeComponent>;
  let fixture: ComponentFixture<InstanceType<typeof HomeComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
