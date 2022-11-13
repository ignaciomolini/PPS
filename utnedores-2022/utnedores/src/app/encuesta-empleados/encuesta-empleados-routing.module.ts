import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EncuestaEmpleadosPage } from './encuesta-empleados.page';

const routes: Routes = [
  {
    path: '',
    component: EncuestaEmpleadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncuestaEmpleadosPageRoutingModule {}
