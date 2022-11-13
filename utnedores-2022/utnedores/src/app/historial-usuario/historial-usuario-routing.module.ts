import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialUsuarioPage } from './historial-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialUsuarioPageRoutingModule {}
