import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OwnListPage } from './own-list.page';

const routes: Routes = [
  {
    path: '',
    component: OwnListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnListPageRoutingModule {}
