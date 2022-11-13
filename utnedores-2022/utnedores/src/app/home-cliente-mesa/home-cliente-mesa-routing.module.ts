import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeClienteMesaPage } from './home-cliente-mesa.page';

const routes: Routes = [
  {
    path: '',
    component: HomeClienteMesaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeClienteMesaPageRoutingModule {}
