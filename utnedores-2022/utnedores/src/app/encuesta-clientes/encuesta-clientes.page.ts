import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Usuario, EncuestaCliente } from '../services/auth.service';
import { UtilidadesService } from '../services/utilidades.service';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-encuesta-clientes',
  templateUrl: './encuesta-clientes.page.html',
  styleUrls: ['./encuesta-clientes.page.scss'],
})

export class EncuestaClientesPage implements OnInit, OnDestroy {
  
  flagAux = true;
  volumenOn = true;
  formEncuesta: FormGroup;
  spinner: boolean = false;
  users: Usuario[];
  valores = [1, 2, 3, 4, 5];
  tipo = "";
  nombreFotos: string[] = ["", "", ""];
  srcProductPhoto: string[] = ["../../assets/galeria.png", "../../assets/galeria.png", "../../assets/galeria.png"];
  fotoCargada = false;
  fotosLleno = false;
  prodPhoto = "../../assets/galeria.png";
  files: File[] = [];
  encuestaEnviada = false;
  idEncuesta = "0";
  encuestas: EncuestaCliente[];
  idUsuarioEncuesta = "0";
  subEncuestas: Subscription;

  constructor(
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private utilidades: UtilidadesService
  ) {
    this.spinner = true;
    this.DesactivarSpinner();
    this.Sonido();
    setTimeout(() => {
      this.GuardarPerfil();
    }, 2500);
    this.AsignarNombreFotos();
    this.TraerEncuestasClientes();
  }

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
    }, 7000);
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
    this.subEncuestas.unsubscribe();
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

  TraerEncuestasClientes() {
    this.subEncuestas = this.authService.traerEncuestaCliente().subscribe(listaencuestas => {
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
    var selectFile = event.target.files;
    var num = selectFile.length;
    var cant = 0;
    var indice = 0;

    for (var i = 0; i < this.srcProductPhoto.length; i++) {
      if (this.srcProductPhoto[i].includes(this.prodPhoto)) {
        cant = cant + 1;
      }
    }

    if (num <= cant) {

      if (this.files[0] == null) {
        this.files[0] = event.target.files[indice];
        this.AsignarImagen(0);
        indice = indice + 1;
      }

      if (this.files[1] == null && num >= (indice + 1)) {
        this.files[1] = event.target.files[indice];
        this.AsignarImagen(1);
        indice = indice + 1;
      }

      if (this.files[2] == null && num >= (indice + 1)) {
        this.files[2] = event.target.files[indice];
        this.AsignarImagen(2);
      }
      this.fotosLleno = true;
      this.flagAux = false;

      setTimeout(() => {
        this.flagAux = true;
        this.fotoCargada = true;
        for (var i = 0; i < 3; i++) {
          if (this.srcProductPhoto[i] === this.prodPhoto) {
            this.fotosLleno = false;
            this.fotoCargada = false;
          }
        }
      }, 1500);
    }
    else {
      if (cant == 1) {
        this.Alerta("Seleccionar 1 imagen", 'warning');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
      } else {
        this.Alerta(("Seleccionar " + cant.toString() + " imágenes"), 'warning');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
      }
    }
  }

  async Alerta(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present()
  }

  AsignarImagen(indice: number) {
    var readerVar = new FileReader();
    readerVar.readAsDataURL(this.files[indice]);
    readerVar.onload = (_event) => {
      this.srcProductPhoto[indice] = (readerVar.result).toString();
    }
  }

  Fotos() {
    (<HTMLInputElement>document.getElementById('inputFiles')).click();
  }

  LimpiarFoto(num: number) {
    this.files[num] = null;
    this.srcProductPhoto[num] = this.prodPhoto;
    this.fotosLleno = false;
    this.fotoCargada = false;
  }

  ImagenCelular() {
    (<HTMLInputElement>document.getElementById('inputFiles')).click();
  }

  Foto() { }

  GuardarPerfil() {
    var usuarioLogueado = this.authService.usuarioActual();
    setTimeout(() => {
      this.authService.getUsers().subscribe(allUsers => {
        this.users = allUsers;
        for (var i = 0; i < allUsers.length; i++) {
          if (((this.users[i].correo).toLocaleLowerCase()).includes((usuarioLogueado.toLocaleLowerCase()))) {
            this.tipo = this.users[i].tipo;
            this.idUsuarioEncuesta = this.users[i].idUsuario;
            i = allUsers.length;
          }
        }
        this.spinner = false;
      });
    }, 1500);
  }

  enviarEncuesta() {

    if(this.idEncuesta === "0"){
      this.TraerEncuestasClientes();
      this.Alerta("Error, reintentar", 'danger');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
    }else{
      this.spinner = true;
      var date = new Date();
      var fechaHoy = this.Caracteres(date.getDate().toString()) + "/" + this.Caracteres(date.getMonth().toString()) + "/" +  date.getFullYear().toString();
      var encuestaCliente : EncuestaCliente = {
        fecha: fechaHoy,
        idUsuario: this.idUsuarioEncuesta,
        idEncuesta: this.idEncuesta,
        atencion: this.preguntaUno.value,
        precioCalidad: this.preguntaDos.value,
        ambiente: this.preguntaTres.value,
        limpieza: this.preguntaCuatro.value,
        rapidez: this.preguntaCinco.value,
        foto1: this.nombreFotos[0],
        foto2: this.nombreFotos[1],
        foto3: this.nombreFotos[2]
      };
      this.authService.agregarEncuestaCliente(encuestaCliente);
      this.SubirImagenes();
    }
  }

  Caracteres(dato: string) {
    var retorno = dato.toString();
    if (dato.length == 1) {
      retorno = "0" + retorno;
    }
    return retorno;
  }

  AsignarNombreFotos() {
    var date = new Date();
    this.nombreFotos[0] =  date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    setTimeout(() => {
      date = new Date();
      this.nombreFotos[1] = date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    }, 2000);
    setTimeout(() => {
      date = new Date();
      this.nombreFotos[2] = date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    }, 4000);
  }

  SubirImagenes() {
    setTimeout(() => {
      this.authService.subirImagenFile(("encuestas/" + this.nombreFotos[0]), this.files[0]);
      setTimeout(() => {
        this.authService.subirImagenFile(("encuestas/" + this.nombreFotos[1]), this.files[1]);
      }, 3000);
      setTimeout(() => {
        this.authService.subirImagenFile(("encuestas/" + this.nombreFotos[2]), this.files[2]);
      
        this.spinner = false;
        this.encuestaEnviada = true;
        if(this.volumenOn){
          this.utilidades.SonidoAlta();
        }
    
        setTimeout(() => {
          this.Volver();
        }, 2500);
      
      }, 6000);
    }, 2000);
  }

  Volver() {
    this.spinner = true;
    this.router.navigateByUrl('/home-cliente-mesa', { replaceUrl: true });
  }
}
