import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResultadosEncuestasEmpleadoPage } from './resultados-encuestas-empleado.page';

describe('ResultadosEncuestasEmpleadoPage', () => {
  let component: ResultadosEncuestasEmpleadoPage;
  let fixture: ComponentFixture<ResultadosEncuestasEmpleadoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultadosEncuestasEmpleadoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadosEncuestasEmpleadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
