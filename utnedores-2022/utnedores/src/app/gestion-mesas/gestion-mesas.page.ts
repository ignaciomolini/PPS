import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Cuenta, Usuario, Mesa, Pedido } from '../services/auth.service';
import { ChatService, Chat } from '../services/chat.service';
import { getDownloadURL } from '@angular/fire/storage';
import { getStorage, ref } from "firebase/storage";
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-mesas',
  templateUrl: './gestion-mesas.page.html',
  styleUrls: ['./gestion-mesas.page.scss'],
})
export class GestionMesasPage implements OnInit, OnDestroy {

  volumenOn = true;
  cargando = true;
  mesas: Mesa [];
  hayMesas = false;
  spinner = false;
  pedidos: Pedido [];
  cuentas: Cuenta[];
  chats: Chat[];
  recargar = true;
  subMesas: Subscription;
  subPedidos: Subscription;
  subChats: Subscription;
  subCuentas: Subscription;

  constructor(
    private toastController: ToastController,
    public router: Router ,
    private authService: AuthService,
    private utilidades: UtilidadesService,
    private chatService: ChatService
  ) { 
    this.Sonido();
    this.ActivarSpinner();
    this.TraerMesas();
    this.TraerPedidos();
    this.TraerChat();
    this.TraerCuentas();
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
    this.subMesas.unsubscribe();
    this.subPedidos.unsubscribe();
    this.subCuentas.unsubscribe();
    this.subChats.unsubscribe();
  }

  TraerCuentas() {
    this.subCuentas = this.authService.traerCuentas().subscribe(listaCuentas => {
      if(this.recargar){
        this.cuentas = listaCuentas;
      }
    });
  }

  TraerChat() {
    this.subChats = this.chatService.cargarChats("chats", false).subscribe(listaChats => {
      if(this.recargar){
        this.chats = listaChats;
      }
    });
  }

  TraerPedidos() {
    this.subPedidos = this.authService.traerPedidos().subscribe(pedidos => {
      if(this.recargar){
        this.pedidos = pedidos;
      }
    });
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

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;

      this.mesas.forEach(u => {
        const storage = getStorage();
        const storageRef = ref(storage, ("mesas/" + u.foto));

        getDownloadURL(storageRef).then((response) => {
          u.foto = response;
        });
        if(this.mesas.length > 0){
          this.hayMesas = true;
        }
      });

      for(var i = 0 ; i < this.mesas.length - 1; i++){
        for(var k = i + 1 ; k < this.mesas.length; k++){
          if((Number(this.mesas[i].numMesa)) > (Number(this.mesas[k].numMesa))){
            var mesaAux = this.mesas[i];
            this.mesas[i] = this.mesas[k];
            this.mesas[k] = mesaAux;
          }
        }
      }
      this.spinner = false;
      this.cargando = false
    });
    setTimeout(() => {
    }, 4000);
  }

  ngOnInit() {

  }

  ActivarSpinner() {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.cargando = false
    }, 5000);
  }

  Volver() {
    this.spinner = true;
    setTimeout(() => {
      this.router.navigateByUrl('/home-metre', { replaceUrl: true });
    }, 1000);
  }

  Liberar(idField: string, idUsuario: string, numMesa: string){
    this.recargar = false;
    this.ActivarSpinner();
    this.authService.asignarMesa(idField, "0");

    this.pedidos.forEach(pedido => {
      if(pedido.numMesa === numMesa){
        this.authService.eliminarPedido(pedido.idField);
      }
    });
    this.cuentas.forEach(cuenta => {
      if(cuenta.idUsuario === idUsuario){
        this.authService.eliminarCuenta(cuenta.idField);
      }
    });
    this.chats.forEach(chat => {
      if(chat.numMesa === numMesa){
        const obj = {leido: false, mensajes: []};
        this.chatService.modificarChat(obj, `chats/${chat.idField}`);
      }
    });

    setTimeout(() => {
      this.Alerta("Mesa liberada", 'success');
      if(this.volumenOn){
        this.utilidades.SonidoConfirmar();
      }
    }, 5500);
  }

  Modificar(idField: string){

  }

  Eliminar(idField: string){

  }
  
}