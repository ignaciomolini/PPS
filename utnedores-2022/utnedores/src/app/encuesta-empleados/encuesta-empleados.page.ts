import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, Usuario, EncuestaEmpleado } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Camera, CameraOptions } from "@awesome-cordova-plugins/camera/ngx";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-encuesta-empleados',
  templateUrl: './encuesta-empleados.page.html',
  styleUrls: ['./encuesta-empleados.page.scss'],
})
export class EncuestaEmpleadosPage implements OnInit, OnDestroy {
  
  volumenOn = true;
  formEncuesta: FormGroup;
  spinner: boolean = false;
  users: Usuario[];
  valores = [1, 2, 3, 4, 5];
  tipo = "";
  srcUserPhoto = "../../assets/galeria.png";
  fotoCargada = false;
  base64Image = "";
  fotoFile = false;
  fotoCelular = false;
  file: File;
  idEncuesta = "0";
  encuestas: EncuestaEmpleado[];
  encuestaEnviada = false;
  usuarioActual: Usuario;
  subEncuestas: Subscription;
  subUsers: Subscription;	

  options: CameraOptions = {
    quality: 50,
    allowEdit: false,
    correctOrientation: true,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    saveToPhotoAlbum: true,
    sourceType: this.camera.PictureSourceType.CAMERA,
    destinationType: this.camera.DestinationType.DATA_URL
  }

  constructor(
    private toastController : ToastController,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private utilidades: UtilidadesService,
    private camera: Camera,
  ) {
    this.spinner = true;
    this.DesactivarSpinner();
    this.Sonido();
    setTimeout(() => {
      this.GuardarPerfil();
    }, 2000);
    this.TraerEncuestasEmpleados();
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

  ngOnDestroy(){	
    this.subUsers.unsubscribe();
    this.subEncuestas.unsubscribe();
  }

  TraerEncuestasEmpleados() {
    this.subEncuestas = this.authService.traerEncuestaEmpleado().subscribe(listaencuestas => {
      this.encuestas = listaencuestas;
      this.idEncuesta = "0";
      this.encuestas.forEach(encuesta => {
        if((Number(encuesta.idEncuesta)) > (Number(this.idEncuesta))){
          this.idEncuesta = encuesta.idEncuesta;
        }
      });
      this.idEncuesta = (Number(this.idEncuesta) + 1).toString();
    });
  }

  Foto() {
    this.camera.getPicture(this.options).then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.srcUserPhoto = this.base64Image;
      this.fotoFile = false;
      this.fotoCargada = true;
      this.fotoCelular = true;
    }, (err) => {
    });
  }

  DesactivarSpinner(){
    setTimeout(() => {
      this.spinner = false;
    }, 6000);
  }

  ngOnInit() {
    this.formEncuesta = this.fb.group(
      {
        preguntaUno: ['', [Validators.required, Validators.pattern('^([1-5])$'), Validators.maxLength(1)]],
        preguntaDos: ['', [Validators.required]],
        preguntaTres: ['', [Validators.required]],
        preguntaCuatro: ['', [Validators.required]],
        preguntaCinco: ['1', [Validators.required]]
      }
    )
  }

  async Alerta( mensaje : string , color : string ) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  get preguntaUno() {
    return this.formEncuesta.get('preguntaUno');
  }

  get preguntaDos() {
    return this.formEncuesta.get('preguntaDos');
  }

  get preguntaTres() {
    return this.formEncuesta.get('preguntaTres');
  }

  get preguntaCuatro() {
    return this.formEncuesta.get('preguntaCuatro');
  }

  get preguntaCinco() {
    return this.formEncuesta.get('preguntaCinco');
  }

  cambios(event, numero) {
    for (let i = 1; i <= 5; i++) {
      if (!event.target.checked) {
        if (i < numero) {
          const input = document.getElementById(`check-${i}`);
          (input as HTMLInputElement).checked = true;
        }
      } else {
        if (i > numero) {
          const input = document.getElementById(`check-${i}`);
          (input as HTMLInputElement).checked = false;
        }
      }
    }
    (event.target as HTMLInputElement).checked = false;
    this.preguntaDos.setValue(numero);
  }

  Cargar(event: any): void {
    this.file = event.target.files[0];
    this.AsignarImagen();
    this.fotoCargada = true;
    this.fotoFile = true;
    this.fotoCelular = false;
  }

  AsignarImagen() {
    var readerVar = new FileReader();
    readerVar.readAsDataURL(this.file);
    readerVar.onload = (_event) => {
      this.srcUserPhoto = (readerVar.result).toString();
    }
  }

  ImagenCelular() {
    (<HTMLInputElement>document.getElementById('inputFiles')).click();
  }

  GuardarPerfil() {
    var usuarioLogueado = this.authService.usuarioActual();
    setTimeout(() => {
      this.subUsers = this.authService.getUsers().subscribe(allUsers => {
        this.users = allUsers;
        for (var i = 0; i < allUsers.length; i++) {
          if (((this.users[i].correo).toLocaleLowerCase()).includes((usuarioLogueado.toLocaleLowerCase()))) {
            this.tipo = this.users[i].tipo;
            this.usuarioActual = allUsers[i];
            i = allUsers.length;
          }
        }
        this.spinner = false;
      });
    }, 1500);
  }

  SaltarEncuesta() {
    this.spinner = true;
    if (this.tipo.includes("Metre")) {
      this.router.navigateByUrl('/home-metre', { replaceUrl: true });
    } else {
      if (this.tipo.includes("Mozo")) {
        this.router.navigateByUrl('/home-mozo', { replaceUrl: true });
      } else {
        if (this.tipo.includes("Bartender") || this.tipo.includes("Cocinero")) {
          this.router.navigateByUrl('/home-cocina', { replaceUrl: true });
        } else {
          this.spinner = false;
          this.Alerta("Ocurrió un error! Reintentar", 'danger');
          this.GuardarPerfil();
        }
      }
    }
  }

  Caracteres(dato: string) {
    var retorno = dato.toString();
    if (dato.length == 1) {
      retorno = "0" + retorno;
    }
    return retorno;
  }

  enviarEncuesta() {

    if(this.idEncuesta === "0"){
      this.TraerEncuestasEmpleados();
      this.Alerta("Error, reintentar", 'danger');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
    }else{

      this.spinner = true;
      this.DesactivarSpinner();
      var date = new Date();
      var nombreImagen = date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    
      var unaEncuesta: EncuestaEmpleado = {
        idUsuario: this.usuarioActual.idUsuario,
        idEncuesta: this.idEncuesta,
        ambiente: this.preguntaUno.value,
        orden: this.preguntaDos.value,
        limpieza: this.preguntaTres.value,
        estadoCocina: this.preguntaCuatro.value,
        estadoBanios: this.preguntaCinco.value,
        foto1: nombreImagen
      };
      this.authService.agregarEncuestaEmpleado(unaEncuesta);

      setTimeout(() => {

        if (this.fotoCelular) {
          var rutaImagen = "encuestaempleado/" + nombreImagen;
          this.authService.subirImagenBase64(rutaImagen, this.base64Image);
        }
  
        if (this.fotoFile) {
          var imagenStorage = "encuestaempleado/" + nombreImagen;
          this.authService.subirImagenFile(imagenStorage, this.file);
        }

        this.spinner = false;
        this.encuestaEnviada = true;
        if(this.volumenOn){
          this.utilidades.SonidoAlta();
        }
        setTimeout(() => {
          this.SaltarEncuesta();
        }, 3000);

      }, 2000);
    }
  }
}
