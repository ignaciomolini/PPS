import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResultadosEncuestasClientePage } from './resultados-encuestas-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: ResultadosEncuestasClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResultadosEncuestasClientePageRoutingModule {}
