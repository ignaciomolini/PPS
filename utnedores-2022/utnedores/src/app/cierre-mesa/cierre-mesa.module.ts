import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CierreMesaPageRoutingModule } from './cierre-mesa-routing.module';

import { CierreMesaPage } from './cierre-mesa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CierreMesaPageRoutingModule
  ],
  declarations: [CierreMesaPage]
})
export class CierreMesaPageModule {}
