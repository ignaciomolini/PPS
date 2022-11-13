import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, Usuario } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { DataUsuarioService } from '../services/data-usuario.service';
import { PushNotificationService } from '../services/push-notification.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  formLogin: FormGroup;
  spinner = false;

  users: Usuario[];
  usersSelect: Usuario[];
  perfil = "";
  tipo = "";
  selectNoDisponible = true;
  selectTitle = "Cargando...";
  subUsers: Subscription;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private utilidades: UtilidadesService,
    private dataUsuarioService: DataUsuarioService,
    private pnService: PushNotificationService
  ) {
    this.TraerUsuarios();
  }

  ngOnDestroy(){
    this.subUsers.unsubscribe();
  }

  TraerUsuarios() {
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
      this.users = allUsers;
      for(var i = 0 ; i < this.users.length - 1; i++){
        for(var k = i + 1; k < this.users.length ; k++){
          if((this.users[i].tipo).localeCompare(this.users[k].tipo) == 1){
            var userA = this.users[i];
            this.users[i] = this.users[k];
            this.users[k] = userA;
          }
        }
      }
      this.usersSelect = new Array();
      for(var i = 0 ; i < this.users.length; i++){
        if(this.users[i].clave != "111111111111"){
          this.usersSelect.push(this.users[i]);
        }
      }
      if(this.users.length == 0){
        this.selectTitle = "Error en la conexión";
      }else{
        this.selectTitle = "Acceso rápido";
        this.selectNoDisponible = false;
      }
    });
  }

  ngOnInit() {
    this.formLogin = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    )
  }

  get email() {
    return this.formLogin.get('email');
  }

  get password() {
    return this.formLogin.get('password');
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

  customAlertOptions = {
    header: 'Elija un usuario',
    translucent: true
  };

  llenarCampos(event) {
    this.email.setValue(this.usersSelect[event.target.value].correo);
    this.password.setValue(this.usersSelect[event.target.value].clave);
  }

  SonidoIngreso(){
    this.utilidades.PlayLogin();
  }

  Registrarse(){
    this.spinner = true;
    localStorage.setItem('Perfil', 'Cliente');
    localStorage.setItem('sonido', "Si");
    this.router.navigateByUrl('/alta-cliente', { replaceUrl: true });
  }

  Anonimo(){
    this.spinner = true;
    this.router.navigateByUrl('/alta-anonimo', { replaceUrl: true });
  }

  async iniciarSesion() {
    this.spinner = true;
    var idFieldToken = "";
    
    const data = { email: this.email.value, password: this.password.value };
    const user = await this.authService.login(data);
    if (user) {
      for (var i = 0; i < this.usersSelect.length; i++) {
        if (((this.usersSelect[i].correo).toLocaleLowerCase()) === ((this.email.value.toLocaleLowerCase()))) {
          this.perfil = this.usersSelect[i].perfil;
          idFieldToken = this.usersSelect[i].idField;
          break;
        }
      }
      localStorage.setItem('sonido', "Si");
      if (this.perfil.includes("Dueño") || this.perfil.includes("Supervisor")) {
        this.pnService.getUser(idFieldToken);
        setTimeout(()=>{
          this.router.navigateByUrl('/home', { replaceUrl: true });
        },1500);
        this.SonidoIngreso();
      } else {
        if (this.perfil.includes("Cliente")) {
          this.router.navigateByUrl('/home-cliente', { replaceUrl: true });
          this.SonidoIngreso();
        } else {
          if (this.perfil.includes("Empleado")) {
            this.pnService.getUser(idFieldToken);
            setTimeout(()=>{
              this.router.navigateByUrl('/encuesta-empleados', { replaceUrl: true });
            },1500);
            this.SonidoIngreso();
          }else{
            //ERROR
            this.spinner = false;
          }
        }
      }
      this.authService.getUser(this.email.value).then((user: Usuario) => {
        this.dataUsuarioService.setUsuario = user;
      });
    }
    else {
      this.spinner = false;
      this.Alerta('Correo o clave incorrecto/a!', 'danger');
      this.utilidades.SonidoError();
      this.utilidades.VibrarError();
    }
  }

}
