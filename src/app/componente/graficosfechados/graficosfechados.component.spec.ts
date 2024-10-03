import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficosfechadosComponent } from './graficosfechados.component';

describe('GraficosfechadosComponent', () => {
  let component: GraficosfechadosComponent;
  let fixture: ComponentFixture<GraficosfechadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficosfechadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficosfechadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
