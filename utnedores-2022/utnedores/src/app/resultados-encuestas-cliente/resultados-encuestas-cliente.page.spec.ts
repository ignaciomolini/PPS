import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResultadosEncuestasClientePage } from './resultados-encuestas-cliente.page';

describe('ResultadosEncuestasClientePage', () => {
  let component: ResultadosEncuestasClientePage;
  let fixture: ComponentFixture<ResultadosEncuestasClientePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultadosEncuestasClientePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadosEncuestasClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
