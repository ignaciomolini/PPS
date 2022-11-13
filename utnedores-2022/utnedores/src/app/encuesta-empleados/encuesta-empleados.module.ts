import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EncuestaEmpleadosPageRoutingModule } from './encuesta-empleados-routing.module';

import { EncuestaEmpleadosPage } from './encuesta-empleados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EncuestaEmpleadosPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EncuestaEmpleadosPage]
})
export class EncuestaEmpleadosPageModule {}
