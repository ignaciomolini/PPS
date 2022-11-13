import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EncuestaClientesPageRoutingModule } from './encuesta-clientes-routing.module';

import { EncuestaClientesPage } from './encuesta-clientes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EncuestaClientesPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EncuestaClientesPage]
})
export class EncuestaClientesPageModule {}
