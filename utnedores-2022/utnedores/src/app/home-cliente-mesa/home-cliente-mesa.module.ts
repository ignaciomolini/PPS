import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeClienteMesaPageRoutingModule } from './home-cliente-mesa-routing.module';

import { HomeClienteMesaPage } from './home-cliente-mesa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeClienteMesaPageRoutingModule
  ],
  declarations: [HomeClienteMesaPage]
})
export class HomeClienteMesaPageModule {}
