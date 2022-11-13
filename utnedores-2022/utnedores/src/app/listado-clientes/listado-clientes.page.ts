import { Component, OnInit, OnDestroy } from '@angular/core';
import { getStorage, ref } from "firebase/storage";
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { getDownloadURL } from '@angular/fire/storage';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-listado-clientes',
  templateUrl: './listado-clientes.page.html',
  styleUrls: ['./listado-clientes.page.scss'],
})
export class ListadoClientesPage implements OnInit, OnDestroy {

  volumenOn = true;
  spinner = true;
  users: Usuario[];
  pathFoto = "../../assets/user-photo.png";
  hayPendientes = false;
  countPendientes = 0;
  ingresar = true;
  currentEmail = "";
  currentPassword = "";
  ingresarMotivoRechazo = false;
  cargando = true;
  subUsers: Subscription;

  idFieldRechazar = "";
  correoRechazar = "";
  
  correoAprobado1 = "¡Hola, ";
  correoAprobado2 = "! \n\nQue alegría tenerte en Utnedores. Su presencia significa mucho para nosotros! \nAhora que eres parte ya puedes ingresar a nuestra app! \n\nAtte. Utnedores";
  
  correoRechazadoCM1 = "Estimado cliente, lamentamos comunicarle que su solicitud fue rechazada por el siguiente motivo:\n";
  correoRechazadoCM2 = "\n\nAtte. Utnedores";

  correoRechazadoSM = "Estimado cliente, lamentamos comunicarle que su solicitud fue rechazada. \n\nAtte. Utnedores";

  constructor(
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private utilidades: UtilidadesService
  ) {
    this.Sonido();
    this.DesactivarSpinner();
    this.ValidarUsuarios();
    setTimeout(() => {
      this.ObtenerPerfil();
    }, 2500);
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
  }

  async Alerta(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
  
  EnviarCorreo(correo: string, texto: string){
    var dataToSend = {email: correo, text: texto};
    this.authService.enviarCorreo(dataToSend).subscribe((dataReturn)=>{
      //this.dataRecibida.JSON.stringify(dataReturn);
    });
  }

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
      this.cargando = false;
    }, 7000);
  }

  ObtenerPerfil() {
    this.authService.getUser(this.authService.usuarioActual()).then(user => {
      this.currentEmail = user.correo;
      this.currentPassword = user.clave;
    });
  }

  async ValidarUsuarios() {

    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
      this.cargando = true;
      this.hayPendientes = false;
      this.countPendientes = 0;
      if(this.ingresar){
        this.ingresar = false;
        this.users = allUsers;
        this.users.forEach(u => {
          if(u.perfil == "Cliente" && u.tipo == "Registrado" && u.aprobado == "No") {
            
            var fotoBuscar = "usuarios/" + u.foto;
            const storage = getStorage();
            const storageRef = ref(storage, fotoBuscar);
            getDownloadURL(storageRef).then((response) => {
              u.foto = response;
            });
            this.countPendientes ++;
          }
        });
        setTimeout(() => {
          if(this.countPendientes > 0){
            this.hayPendientes = true;
          }else{
            this.hayPendientes = false;
          }
          this.cargando = false;
          setTimeout(() => {
            this.ingresar = true;
          }, 5500);
        }, 3000);
      }
    });

    setTimeout(() => {
      if(this.users.length == 0){
        //ERROR DE CONEXION
      }
      this.cargando = false;
      this.spinner = false;
    }, 7000);
  }

  ngOnInit() { 
    
  }

  Volver(){
    this.spinner = true;
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  AprobarCliente(idField: string, correo: string, clave: string, nombre: string){
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.Alerta("Usuario aprobado!",'success');
      if(this.volumenOn){
        this.utilidades.SonidoConfirmar();
      }
    }, 9000);
    this.authService.aceptarUsuario(idField);

    setTimeout(() => {
      var texto = this.correoAprobado1 + nombre + this.correoAprobado2;
      this.EnviarCorreo(correo, texto);
      setTimeout(() => {
        var currentUser = { emailCurrent: this.currentEmail, passwordCurrent: this.currentPassword };
        this.authService.register({emailNuevo: correo, passwordNuevo: clave}, currentUser);
      }, 2000);
    }, 2000);
  }

  RechazarCliente(idField: string, correo: string){
    this.idFieldRechazar = idField;
    this.correoRechazar = correo;
    this.ingresarMotivoRechazo = true;
  }

  AceptarRechazo(){
    var motivoRechazo = (<HTMLInputElement>document.getElementById('motivoRechazo')).value;

    setTimeout(() => {
      this.ingresarMotivoRechazo = false;
      this.spinner = true;
      setTimeout(() => {
        this.Alerta("Usuario rechazado",'warning');
        if(this.volumenOn){
          this.utilidades.SonidoRechazar();
        }
        this.utilidades.VibrarRechazar();
      }, 3500);
    }, 500);

    this.authService.rechazarUsuario(this.idFieldRechazar);
    
    setTimeout(() => {
      if(motivoRechazo.length == 0){
        this.EnviarCorreo(this.correoRechazar, this.correoRechazadoSM);
      }else{
        var texto = this.correoRechazadoCM1 + motivoRechazo + this.correoRechazadoCM2;
        this.EnviarCorreo(this.correoRechazar, texto); 
      }

      setTimeout(() => {
        this.idFieldRechazar = "";
        this.correoRechazar = "";
      }, 1000);
      this.spinner = false;
    }, 2500);
  }

  CancelarRechazo() {
    this.idFieldRechazar = "";
    this.correoRechazar = "";
    this.ingresarMotivoRechazo = false;
  }
}
