import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataService } from '../services/data.service';
import { DbService } from '../services/db.service';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.page.html',
  styleUrls: ['./photo.page.scss'],
})
export class PhotoPage implements OnInit {
  public descripcionFoto: FormGroup;
  imagen = {
    name: '',
    path: '',
    data: ''
  };
  subBackBtn: Subscription;
  tipo: string;

  constructor(private router: Router, public photoService: PhotoService,
    private dbService: DbService, private fb: FormBuilder, private loadingController: LoadingController,
    private dataService: DataService, private platform: Platform,
    private toastController: ToastController) { }

  ngOnInit() {
    this.sacarFoto();
    this.descripcionFoto = this.fb.group(
      {
        descripcion: ['', [Validators.required, Validators.maxLength(20)]],
      }
    )
    this.dataService.tipo$.subscribe(tipo => {
      this.tipo = tipo;
    }).unsubscribe();
    this.subBackBtn = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('menu')
    })
  }

  ngOnDestroy() {
    this.subBackBtn.unsubscribe();
  }

  get descripcion() {
    return this.descripcionFoto.get('descripcion');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2500
    });
    toast.present();
  }

  async guardarFoto() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const response = await fetch(this.imagen.data);
    const blob = await response.blob();
    this.loadingController.create({
      message: '<img src="../../assets/images/iconoSolo.png">',
      spinner: null,
      cssClass: 'loader-css-class',
    }).then(response => {
      response.present();
      this.dbService.subirImagen(blob, this.imagen.path).then(resp => {
        const foto = {
          fecha: Date.now(), ruta: resp, autor: usuario.nombre, uidAutor: usuario.uid, votos: [], descripcion: this.descripcionFoto.controls['descripcion'].value, tipo: this.tipo
        }
        this.dbService.agregarDatos(foto, 'fotos').then(() => {
          this.loadingController.dismiss();
          this.router.navigateByUrl('menu');
          this.presentToast('Foto subida con exito!', 'success');
        });
      });
    });
  }

  async sacarFoto() {
    try {
      this.imagen = await this.photoService.takePhoto();
    } catch (error) {
      this.router.navigateByUrl('menu');
    }
  }

}
