import { UtilidadesService } from '../services/utilidades.service';
import { AuthService, Cuenta, Mesa, Pedido } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chat, ChatService } from '../services/chat.service';

@Component({
  selector: 'app-cierre-mesa',
  templateUrl: './cierre-mesa.page.html',
  styleUrls: ['./cierre-mesa.page.scss'],
})
export class CierreMesaPage implements OnInit, OnDestroy {

  cuentas: Cuenta[];
  hayCuenta = false;
  cargando = true;
  cierrePendiente = false;
  cierreListo = false;
  cierresPendientes = [];
  cierresListos = [];
  spinner = false;
  volumenOn = true;
  mesas: Mesa[];
  pedidos: Pedido[];
  subMesas: Subscription;
  subPedidos: Subscription;
  subCuentas: Subscription;
  subChat: Subscription;
  idFieldEliminarChat = "";

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private utilidades: UtilidadesService,
    private chatService: ChatService,
  ) { 
    this.spinner = true;
    this.DesactivarSpinner();
    this.Sonido();
    this.TraerCuentas();
    this.TraerMesas();
    this.TraerPedidos();
  }

  ngOnInit() {
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

  TraerChatMesa(numMesa){
    this.subChat = this.chatService.cargarChatMesa('chats', numMesa).subscribe((chat: Chat[]) => {
      this.idFieldEliminarChat = chat[0].idField;
      this.subChat.unsubscribe();
    });
  }

  TraerPedidos(){
    this.subPedidos = this.authService.traerPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;
    });
  }

  ngOnDestroy(){	
    this.subMesas.unsubscribe();
    this.subPedidos.unsubscribe();
    this.subCuentas.unsubscribe();
  }

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
      for (var i = 0; i < this.mesas.length - 1; i++) {
        for (var k = i + 1; k < this.mesas.length; k++) {
          if ((Number(this.mesas[i].numMesa)) > (Number(this.mesas[k].numMesa))) {
            var mesaAux: Mesa = this.mesas[i];
            this.mesas[i] = this.mesas[k];
            this.mesas[k] = mesaAux;
          }
        }
      }
    });
  }

  TraerCuentas() {
    this.subCuentas = this.authService.traerCuentas().subscribe(listaCuentas => {

      this.cierrePendiente = false;
      this.cierreListo = false;
      var cierresPendientesAux = [];
      var cierresListosAux = [];

      this.cuentas = listaCuentas;
      if(this.cuentas.length > 0){
        this.hayCuenta = true;
      }

      this.cuentas.forEach(cuenta => {
        if(cuenta.idUsuario.includes("-1")){
          var unaCuenta = {
            idField: cuenta.idField,
            idUsuario: cuenta.idUsuario,
            consumo: cuenta.total,
            propina: cuenta.propina,
            mesas: cuenta.mesas,
            total: ((Number(cuenta.total)) + (Number(cuenta.propina)))
          };
          cierresListosAux.push(unaCuenta);
          this.cierreListo = true;
        }
        if(!cuenta.idUsuario.includes("-1")){
          var unaCuenta = {
            idField: cuenta.idField,
            idUsuario: cuenta.idUsuario,
            consumo: cuenta.total,
            propina: cuenta.propina,
            mesas: cuenta.mesas,
            total: ((Number(cuenta.total)) + (Number(cuenta.propina)))
          };
          cierresPendientesAux.push(unaCuenta);
          this.cierrePendiente = true;
        }
      });

      this.cierresPendientes = cierresPendientesAux;
      this.cierresListos = cierresListosAux;

      setTimeout(() => {
        this.cargando = false;
        this.spinner = false;
      }, 1500);
    });
  }

  async Alerta(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'bottom',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  async Cerrar(idField: string, idUsuario: string){
    this.spinner = true;
    this.DesactivarSpinner();
    var numMesaChat = "";
    var once = true;

    for(var i = 0 ; i < this.mesas.length ; i++){
      if(this.mesas[i].idUsuario === idUsuario){

        if(once){
          once = false;
          numMesaChat = this.mesas[i].numMesa;
          this.TraerChatMesa(numMesaChat);
        }

        this.authService.liberarMesa(this.mesas[i].idField);
        await new Promise(f => setTimeout(f, 1000));
      }
    }

    for(var i = 0 ; i < this.pedidos.length ; i++){
      if(this.pedidos[i].idUsuario === idUsuario){
        this.authService.eliminarPedido(this.pedidos[i].idField);
        await new Promise(f => setTimeout(f, 1000));
      }
    }

    this.chatService.eliminarChat(`chats/${this.idFieldEliminarChat}`);

    this.authService.cerrarCuenta(idField);
    this.spinner = false;
    this.Alerta("Cierre exitoso!",'success');
    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
  }

  Volver(){
    this.router.navigateByUrl('/home-mozo', { replaceUrl: true });
  }
}