import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionMesasPage } from './gestion-mesas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionMesasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionMesasPageRoutingModule {}
