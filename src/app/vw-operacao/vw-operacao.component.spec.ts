import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VwOperacaoComponent } from './vw-operacao.component';

describe('VwOperacaoComponent', () => {
  let component: VwOperacaoComponent;
  let fixture: ComponentFixture<VwOperacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VwOperacaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VwOperacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
