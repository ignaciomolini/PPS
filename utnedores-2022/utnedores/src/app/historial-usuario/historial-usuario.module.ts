import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialUsuarioPageRoutingModule } from './historial-usuario-routing.module';

import { HistorialUsuarioPage } from './historial-usuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialUsuarioPageRoutingModule
  ],
  declarations: [HistorialUsuarioPage]
})
export class HistorialUsuarioPageModule {}
