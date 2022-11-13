import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { UtilidadesService } from '../services/utilidades.service';
import { PushNotificationService } from '../services/push-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  volumenOn = true;
  spinner = true;
  perfil = "Perfil";
  idFieldToken = "";
  subUsers: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private utilidades: UtilidadesService,
    private pnService: PushNotificationService
    ) { 
      this.Sonido();
      this.DesactivarSpinner();
      this.ObtenerPerfil();
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

  DesactivarSpinner(){
    setTimeout(()=>{
      this.spinner = false;
    },5000);
  }

  ObtenerPerfil(){
    this.subUsers = this.authService.getUsers().subscribe((users: Usuario[]) => {
      users.forEach((u: Usuario) => {
        if (u.correo == this.authService.usuarioActual()) {
          this.perfil = u.perfil;
          this.idFieldToken = u.idField;
          this.spinner = false;
        }
      })
      this.subUsers.unsubscribe();
    });
  }

  ngOnInit() {}

  ActivarSpinner(){
    this.spinner = true;
  }

  IrAltaSupervisor(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/alta-supervisor', { replaceUrl: true });
  }

  IrAltaEmpleado(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/alta-empleado', { replaceUrl: true });
  }

  IrAltaMesa(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/alta-mesa', { replaceUrl: true });
  }

  IrAprobarClientes(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/listado-clientes', { replaceUrl: true });
  }

  IrFormulario(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/gestion-usuarios', { replaceUrl: true });
  }

  IrVerReservas(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/reservas', { replaceUrl: true });
  }
  
  IrEncuestaEmpleados(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/resultados-encuestas-empleado', { replaceUrl: true });
  }

  ActivarDesactivarSonido() {
    if(this.volumenOn) {
      this.volumenOn = false;
      localStorage.setItem('sonido', "No");
    } else {
      this.volumenOn = true;
      localStorage.setItem('sonido', "Si");
    }
  }

  SonidoEgreso(){
    if(this.volumenOn) {
      this.utilidades.PlayLogout();
    }
    localStorage.clear();
  }

  CerrarSesion(){
    this.spinner = true;
    setTimeout(()=>{
      this.authService.logout();
      this.pnService.eliminarToken(this.idFieldToken);
    },1000);
    setTimeout(()=>{
      this.SonidoEgreso();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    },2000);
  }
}
