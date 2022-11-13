import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService, Usuario, EncuestaSupervisor } from '../services/auth.service';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-encuesta-supervisor',
  templateUrl: './encuesta-supervisor.page.html',
  styleUrls: ['./encuesta-supervisor.page.scss'],
})
export class EncuestaSupervisorPage implements OnInit, OnDestroy {
  
  volumenOn = true;
  formEncuesta: FormGroup;
  spinner: boolean = false;
  users: Usuario[];
  valores = [1, 2, 3, 4, 5];
  idUsuarioEncuesta = "0";
  idEncuesta = "0";
  encuestas: EncuestaSupervisor[];
  encuestaEnviada = false;
  subEncuestas: Subscription;

  constructor(
    private toastController : ToastController,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private utilidades: UtilidadesService
  ) {
    this.Sonido();
    this.idUsuarioEncuesta = localStorage.getItem('idUsuarioEncuesta');
    this.TraerEncuestasSupervisor();
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

  TraerEncuestasSupervisor() {
    this.subEncuestas = this.authService.traerEncuestaSupervisor().subscribe(listaencuestas => {
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

  ngOnDestroy(){
    this.subEncuestas.unsubscribe();
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

  Volver() {
    this.spinner = true;
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  enviarEncuesta() {
    if(this.idEncuesta === "0"){
      this.TraerEncuestasSupervisor();
      this.Alerta("Error, reintentar", 'danger');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
    }else{
      this.spinner = true;
      this.DesactivarSpinner();

      var unaEncuesta : EncuestaSupervisor = {
        idEncuesta: this.idEncuesta,
        amable: this.preguntaUno.value,
        respeto: this.preguntaDos.value,
        paciencia: this.preguntaTres.value,
        simpatia: this.preguntaCuatro.value,
        higiene: this.preguntaCinco.value,
        idUsuario: this.idUsuarioEncuesta
      };

      this.authService.agregarEncuestaSupervisor(unaEncuesta);

      this.spinner = false;
      this.encuestaEnviada = true;
        if(this.volumenOn){
          this.utilidades.SonidoAlta();
        }
        setTimeout(() => {
          this.Volver();
        }, 3000);
      }
    }
}
