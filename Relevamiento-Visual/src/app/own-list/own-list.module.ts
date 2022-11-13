import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OwnListPageRoutingModule } from './own-list-routing.module';

import { OwnListPage } from './own-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OwnListPageRoutingModule
  ],
  declarations: [OwnListPage]
})
export class OwnListPageModule {}
