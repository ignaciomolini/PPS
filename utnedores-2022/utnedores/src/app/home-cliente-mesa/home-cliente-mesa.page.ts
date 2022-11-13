import { UtilidadesService } from '../services/utilidades.service';
import { AuthService, Mesa, Usuario, Cuenta, EncuestaCliente } from '../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Unsubscribe } from '@angular/fire/firestore';

@Component({
  selector: 'app-home-cliente-mesa',
  templateUrl: './home-cliente-mesa.page.html',
  styleUrls: ['./home-cliente-mesa.page.scss'],
})
export class HomeClienteMesaPage implements OnInit, OnDestroy {

  permisoPedido = true;
  usuarioActual: Usuario;
  spinner = true;
  volumenOn = true;
  mensajeEstado = "Mesa asignada. Ya puede realizar su pedido.";
  cuentas: Cuenta[];
  mesas: Mesa[];
  subMesa: Subscription;
  sub: Unsubscribe;
  subCuentas: Subscription;
  encuestas: EncuestaCliente[];
  subEncuestas: Subscription;
  encuentra = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private utilidades: UtilidadesService
  ) { 
    this.DesactivarSpinner();
    this.Sonido();
  }

  ngOnDestroy(){
    this.subMesa.unsubscribe();
    this.sub();
    this.subCuentas.unsubscribe();
    this.subEncuestas.unsubscribe();
  }

  ngOnInit() {
    this.sub = this.authService.obtenerAuth().onAuthStateChanged(user => {
      this.authService.getUser(user.email).then((user: Usuario) => {
        this.usuarioActual = user;
        this.TraerCuentas();
        this.TraerMesas();
        this.TraerEncuestasClientes();
      });
    })
  }

  TraerEncuestasClientes() {
    this.subEncuestas = this.authService.traerEncuestaCliente().subscribe(listaencuestas => {
      this.encuestas = listaencuestas;
      
      this.encuestas.forEach(encuesta => {
        if((Number(encuesta.idUsuario)) == (Number(this.usuarioActual.idUsuario))){
          this.encuentra = true;
        }
      });
    });
  }

  TraerMesas() {
    this.subMesa = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
      var redirigir = true;
      this.mesas.forEach(mesa => {
        if(mesa.idUsuario === this.usuarioActual.idUsuario && this.usuarioActual.idUsuario != "0"){
          redirigir = false;
        }
      });
      if(redirigir){
        this.Volver();
      }
    });
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

  TraerCuentas() {
    this.subCuentas =this.authService.traerCuentas().subscribe(listaCuentas => {
      this.cuentas = listaCuentas;
      this.cuentas.forEach(cuenta => {
        if(cuenta.idUsuario === this.usuarioActual.idUsuario){
          this.permisoPedido = false;
        }
      });
      this.spinner = false;
    });
  }

  Volver(){
    this.spinner = true;
    this.router.navigateByUrl('/home-cliente', { replaceUrl: true });
  }

  IrPedido(){
    this.spinner = true;
    localStorage.setItem('back', '1');
    this.router.navigateByUrl('/listado-productos', { replaceUrl: true });
  }

  EstadoPedido(){
    localStorage.setItem('pedircuenta', '0');
    this.router.navigateByUrl('/estado-pedido', { replaceUrl: true });
  }

  PedirCuenta(){
    localStorage.setItem('pedircuenta', '1');
    this.router.navigateByUrl('/estado-pedido', { replaceUrl: true });
  }

  ConsultarMozo(){
    this.router.navigateByUrl('/chat', { replaceUrl: true });
  }

  IrJuegos(){
    
  }

  IrEncuestas(){
    this.spinner = true;
    this.router.navigateByUrl('/encuesta-clientes', { replaceUrl: true });
  }

}
