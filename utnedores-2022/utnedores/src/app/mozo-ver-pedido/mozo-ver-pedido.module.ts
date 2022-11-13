import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MozoVerPedidoPageRoutingModule } from './mozo-ver-pedido-routing.module';

import { MozoVerPedidoPage } from './mozo-ver-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MozoVerPedidoPageRoutingModule
  ],
  declarations: [MozoVerPedidoPage]
})
export class MozoVerPedidoPageModule {}
