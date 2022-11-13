import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { UtilidadesService } from '../services/utilidades.service';
import { PushNotificationService } from '../services/push-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-metre',
  templateUrl: './home-metre.page.html',
  styleUrls: ['./home-metre.page.scss'],
})
export class HomeMetrePage implements OnInit, OnDestroy {

  volumenOn = true;
  spinner = false;
  users: Usuario[];
  idFieldToken = "";
  subUsers: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private utilidades: UtilidadesService,
    private pnService: PushNotificationService
  ) { 
    this.DesactivarSpinner();
    this.spinner = true;
    this.Sonido();
    this.ObtenerTipo();
  }

  ngOnDestroy(){	

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

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
    }, 7000);
  }
  
  ObtenerTipo(){
    this.subUsers = this.authService.getUsers().subscribe((users: Usuario[]) => {
      users.forEach((u: Usuario) => {
        if (u.correo == this.authService.usuarioActual()) {
          this.idFieldToken = u.idField;
          this.spinner = false;
        }
      })
    });
  }

  ngOnInit() {}

  ActivarSpinner(){
    this.spinner = true;
  }

  GestionarMesas(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/gestion-mesas', { replaceUrl: true });
  }

  IrAltaCliente(){
    this.ActivarSpinner();
    localStorage.setItem('Perfil', 'Empleado');
    this.router.navigateByUrl('/alta-cliente', { replaceUrl: true });
  }

  IrListaEspera(){
    this.ActivarSpinner();
    this.router.navigateByUrl('/lista-espera', { replaceUrl: true });
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
    this.ActivarSpinner();
    this.subUsers.unsubscribe();
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