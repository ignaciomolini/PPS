import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { AnimalesComponent } from '../components/animales/animales.component';
import { NumerosComponent } from '../components/numeros/numeros.component';
import { ColoresComponent } from '../components/colores/colores.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage, 
    AnimalesComponent, 
    NumerosComponent,
    ColoresComponent
  ]
})
export class HomePageModule { }
