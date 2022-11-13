import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MozoVerPedidoPage } from './mozo-ver-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: MozoVerPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MozoVerPedidoPageRoutingModule {}
