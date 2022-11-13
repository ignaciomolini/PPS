import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultadosEncuestasClientePageRoutingModule } from './resultados-encuestas-cliente-routing.module';

import { ResultadosEncuestasClientePage } from './resultados-encuestas-cliente.page';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultadosEncuestasClientePageRoutingModule,
    NgChartsModule
  ],
  declarations: [ResultadosEncuestasClientePage]
})
export class ResultadosEncuestasClientePageModule {}
