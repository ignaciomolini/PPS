import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaProductoPageRoutingModule } from './alta-producto-routing.module';

import { AltaProductoPage } from './alta-producto.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AltaProductoPageRoutingModule,
    QRCodeModule,
    ReactiveFormsModule
  ],
  declarations: [AltaProductoPage]
})
export class AltaProductoPageModule {}
