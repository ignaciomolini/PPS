import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EncuestaClientesPage } from './encuesta-clientes.page';

const routes: Routes = [
  {
    path: '',
    component: EncuestaClientesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncuestaClientesPageRoutingModule {}
