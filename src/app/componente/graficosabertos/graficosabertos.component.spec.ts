import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficosabertosComponent } from './graficosabertos.component';

describe('GraficosabertosComponent', () => {
  let component: GraficosabertosComponent;
  let fixture: ComponentFixture<GraficosabertosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficosabertosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficosabertosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
