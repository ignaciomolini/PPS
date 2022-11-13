import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenerarQRPageRoutingModule } from './generar-qr-routing.module';

import { GenerarQRPage } from './generar-qr.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenerarQRPageRoutingModule,
    QRCodeModule
  ],
  declarations: [GenerarQRPage]
})
export class GenerarQRPageModule {}
