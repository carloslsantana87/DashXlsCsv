import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficobacklogComponent } from './graficobacklog.component';

describe('GraficobacklogComponent', () => {
  let component: GraficobacklogComponent;
  let fixture: ComponentFixture<GraficobacklogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficobacklogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficobacklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
