import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { UtilidadesService } from '../services/utilidades.service';

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {
  
  volumenOn = true;
  mostrarQr = false;
  public myAngularxQrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";

  constructor(
    private utilidades: UtilidadesService
  ) {
    this.myAngularxQrCode = "GENERARQR";
    this.mostrarQr = true;
    this.Sonido();
  }

  Sonido(){
    try {
      var sonido = localStorage.getItem('sonido');
      if(sonido != null){
        if(sonido.includes("No")){
          this.volumenOn = false;
        }
      }
    } catch (error) {
      
    }
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  ModificarQR(texto: string){
    this.myAngularxQrCode = texto;
  }

  ngOnInit() {
  }

}
