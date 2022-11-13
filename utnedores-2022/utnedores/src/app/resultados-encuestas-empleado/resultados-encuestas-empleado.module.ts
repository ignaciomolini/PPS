import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultadosEncuestasEmpleadoPageRoutingModule } from './resultados-encuestas-empleado-routing.module';

import { ResultadosEncuestasEmpleadoPage } from './resultados-encuestas-empleado.page';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultadosEncuestasEmpleadoPageRoutingModule,
    NgChartsModule
  ],
  declarations: [ResultadosEncuestasEmpleadoPage]
})
export class ResultadosEncuestasEmpleadoPageModule {}
