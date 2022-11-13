import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { DbService } from '../services/db.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  credito: number = null;
  escanerActivado: boolean = false;
  creditosUsuario: any;
  usuario: any;
  subCreditosUsuario: Subscription;
  subCreditos: Subscription;
  result = null;

  constructor(private authService: AuthService, private router: Router, private platform: Platform, private dbService: DbService, private loadingController: LoadingController,
    private toastController: ToastController) { }

  ngOnInit() {
    this.platform.backButton.subscribe(() => {
      if (this.escanerActivado) {
        this.stopScanner();
      }
    });
    this.inicializarCreditosUsuario();
  }

  ngOnDestroy() {
    this.subCreditosUsuario.unsubscribe();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000
    });
    toast.present();
  }

  inicializarCreditosUsuario() {
    this.subCreditosUsuario = this.dbService.obtenerDatosCompleto('creditos-usuarios').pipe(
      map(creditosUsuarios => {
        return creditosUsuarios.map((creditosUsuario: any) => {
          return { idDB: creditosUsuario.payload.doc.id, uidUsuario: creditosUsuario.payload.doc.data().uidUsuario, creditos: creditosUsuario.payload.doc.data().creditos }
        })
      })
    ).subscribe((respuesta: any) => {
      this.usuario = JSON.parse(localStorage.getItem('usuario'));
      const creditosUsuario = respuesta.filter(el => this.usuario.uid == el.uidUsuario);

      if (creditosUsuario.length === 0) {
        this.dbService.agregarDatos({ uidUsuario: this.usuario.uid, creditos: [] }, 'creditos-usuarios').then(resp => {
          this.creditosUsuario = { idDB: resp.id, uidUsuario: this.usuario.uid, creditos: [] };
        })
      } else {
        this.creditosUsuario = creditosUsuario[0];
        let suma = 0;
        for (const credito of creditosUsuario[0].creditos) {
          suma += credito.valor;
        }
        this.credito = suma;
      }
    })
  }

  loading() {
    return this.loadingController.create({
      message: '<img src="../../assets/images/iconoSolo.png">',
      spinner: null,
      duration: 2000,
      cssClass: 'loader-css-class',
    })
  }

  async logout() {
    await this.authService.logout();
    localStorage.clear();
    setTimeout(() => {
      this.router.navigateByUrl('/login', { replaceUrl: true })
    }, 1000);
  }

  limpiarCreditos() {
    this.loading().then(response => {
      response.present();
      response.onDidDismiss().then(() => {
        if (this.creditosUsuario.creditos.length == 0) {
          this.presentToast('No hay creditos por limpiar', 'danger');
        }
        else {
          const obj = { uidUsuario: this.creditosUsuario.uidUsuario, creditos: [] }
          this.dbService.modificarDatos(obj, 'creditos-usuarios', this.creditosUsuario.idDB);
          this.presentToast('Se limpiaron los creditos correctamente', 'success');
        }
      });
    });
  }

  verificarCodigo(codigo: string) {
    codigo = codigo.trim();
    this.subCreditos = this.dbService.obtenerDatos('creditos').subscribe((respuesta: any) => {
      const qr = respuesta.filter(qr => codigo == qr.codigo);
      if (qr.length == 0) {
        this.presentToast('Código QR no registrado en el sistema', 'danger');
      } else {
        if ((this.usuario.perfil == 'admin' &&
          this.creditosUsuario.creditos.filter(el => qr[0].codigo == el.codigo).length < 2)
          ||
          (this.usuario.perfil != 'admin' &&
            this.creditosUsuario.creditos.filter(el => qr[0].codigo == el.codigo).length < 1)) {

          this.creditosUsuario.creditos.push(qr[0]);
          const obj = { uidUsuario: this.creditosUsuario.uidUsuario, creditos: this.creditosUsuario.creditos }
          this.dbService.modificarDatos(obj, 'creditos-usuarios', this.creditosUsuario.idDB).then(() => {
            this.presentToast(`Se acreditaron $${qr[0].valor}`, 'success');
          });
        } else {
          this.presentToast('No se puede cargar mas este código', 'danger');
        }
      }
      this.subCreditos.unsubscribe();
    })
  }

  async startScanner() {
    setTimeout(async () => {
      // document.body.classList.add("qrscanner");
      this.escanerActivado = true;
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        this.stopScanner();
        this.loading().then(response => {
          response.present();
          response.onDidDismiss().then(() => {
            this.verificarCodigo(result.content);
          });
        });
      }
    }, 1000);
  }

  stopScanner() {
    this.escanerActivado = false;
    // document.body.classList.remove("qrscanner");
    BarcodeScanner.stopScan();
  }
}
