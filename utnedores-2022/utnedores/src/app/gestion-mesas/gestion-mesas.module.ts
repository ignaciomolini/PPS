import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionMesasPageRoutingModule } from './gestion-mesas-routing.module';

import { GestionMesasPage } from './gestion-mesas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionMesasPageRoutingModule
  ],
  declarations: [GestionMesasPage]
})
export class GestionMesasPageModule {}
