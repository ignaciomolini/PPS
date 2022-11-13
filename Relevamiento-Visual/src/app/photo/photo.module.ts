import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhotoPageRoutingModule } from './photo-routing.module';

import { PhotoPage } from './photo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhotoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [PhotoPage]
})
export class PhotoPageModule {}
