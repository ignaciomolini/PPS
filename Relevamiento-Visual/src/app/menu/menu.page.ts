import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataService } from '../services/data.service';
import { DbService } from '../services/db.service';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  tipo: string = "lindo";
  imagen = {
    name: '',
    path: '',
    data: ''
  };
  usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  subFotos: Subscription;
  subBackBtn: Subscription;
  arrayFotos: any[] = [];
  arrayFotosPropias: any[] = [];

  constructor(private dataService: DataService, private router: Router, public photoService: PhotoService,
    private dbService: DbService, private toastController: ToastController, private platform: Platform) { }

  ngOnInit() {
    this.subFotos = this.dbService.obtenerDatos('fotos').subscribe(fotos => {
      this.dataService.tipo$.subscribe(tipo => {
        this.tipo = tipo
        fotos.forEach((foto: any) => {
          if (foto.tipo == tipo) {
            this.arrayFotos.push(foto);
          }
          if (foto.tipo == tipo && foto.uidAutor == this.usuarioActual.uid) {
            this.arrayFotosPropias.push(foto);
          }
        });
      })
    })
    this.subBackBtn = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('home')
    })
  }

  ngOnDestroy() {
    this.subBackBtn.unsubscribe();
    this.subFotos.unsubscribe();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2500
    });
    toast.present();
  }

  sacarFoto() {
    setTimeout(() => {
      this.router.navigateByUrl('photo');
    }, 500);
  }

  misFotos() {
    if (this.arrayFotosPropias.length > 0) {
      setTimeout(() => {
        this.router.navigateByUrl('own-list');
      }, 500);
    } else {
      this.presentToast('No hay fotos para mostrar', 'danger');
    }
  }

  listaFotos() {
    if (this.arrayFotos.length > 0) {
      setTimeout(() => {
        this.router.navigateByUrl('list');
      }, 500);
    } else {
      this.presentToast('No hay fotos para mostrar', 'danger');
    }
  }

  grafico() {
    if (this.arrayFotos.length > 0) {
      setTimeout(() => {
        this.router.navigateByUrl('chart');
      }, 500);
    } else {
      this.presentToast('No hay fotos para formar el gráfico', 'danger');
    }
  }

}
