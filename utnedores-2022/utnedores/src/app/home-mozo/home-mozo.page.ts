import { UtilidadesService } from '../services/utilidades.service';
import { AuthService, Pedido, Mesa, Usuario } from '../services/auth.service';
import { Router } from '@angular/router';
import { getDownloadURL } from '@angular/fire/storage';
import { getStorage, ref } from "firebase/storage";
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ToastController } from '@ionic/angular';
import { Chat, ChatService } from '../services/chat.service';
import { PushNotificationService } from '../services/push-notification.service';
import { Subscription } from 'rxjs';
import { DataUsuarioService } from '../services/data-usuario.service';

@Component({
  selector: 'app-home-mozo',
  templateUrl: './home-mozo.page.html',
  styleUrls: ['./home-mozo.page.scss'],
})
export class HomeMozoPage implements OnInit, AfterViewInit, OnDestroy {

  mesas: Mesa[];
  result = null;
  numMesa = "0";
  isModalOpen: boolean = false;
  isModalOpen2: boolean = false;
  scanActive = false;
  pedidos: Pedido[];
  chats: Chat[];
  volumenOn = true;
  spinner = true;
  cantPedidos = 0;
  cantCierreMesas = 0;
  cantPedidosListos = 0;
  cantChat = 0;
  idFieldToken = "";
  subMesas: Subscription;
  subPedidos: Subscription;
  subUsers: Subscription;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private utilidades: UtilidadesService,
    private duService: DataUsuarioService,
    private chatService: ChatService,
    private pnService: PushNotificationService
  ) {
    this.DesactivarSpinner();
    this.Sonido();
    this.TraerPedidos();
    this.TraerMesas();
    this.ObtenerIdField();
  }

  Sonido() {
    try {
      var sonido = localStorage.getItem('sonido');
      if (sonido != null) {
        if (sonido.includes("No")) {
          this.volumenOn = false;
        }
      }
    } catch (error) {

    }
  }

  ObtenerIdField() {
    this.subUsers = this.authService.getUsers().subscribe((users: Usuario[]) => {
      users.forEach((u: Usuario) => {
        if (u.correo == this.authService.usuarioActual()) {
          this.idFieldToken = u.idField;
        }
      })
    });
  }

  CierreMesa() {
    this.router.navigateByUrl('/cierre-mesa', { replaceUrl: true });
  }

  ChatClientes() {
    this.isModalOpen = true;
  }

  ngOnInit() {
    this.chatService.cargarChats('chats', false).subscribe((chats: Chat[]) => {
      const chatAbiertos = [];
      chats.forEach((c: Chat) => {
        if (c.mensajes.length != 0) {
          chatAbiertos.push(c);
        }
      })
      chatAbiertos.sort(function (a, b) {
        if (a.mensajes[a.mensajes.length - 1].fecha < b.mensajes[b.mensajes.length - 1].fecha) {
          return 1;
        }
        if (a.mensajes[a.mensajes.length - 1].fecha > b.mensajes[b.mensajes.length - 1].fecha) {
          return -1;
        }
        return 0;
      })
      this.chats = chatAbiertos;
    })
    this.duService.openModal$.subscribe(resp => {
      this.isModalOpen2 = resp;
    })
  }

  ngAfterViewInit() {
    BarcodeScanner.prepare();
  }

  ngOnDestroy() {
    this.stopScan();
    this.subMesas.unsubscribe();
    this.subPedidos.unsubscribe();
  }

  cargarFoto(numMesa: string) {
    return this.mesas.filter(mesa => mesa.numMesa == numMesa)[0].foto;
  }

  async startScanner() {
    this.scanActive = true;
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      this.scanActive = false;
      this.result = result.content;
      this.AnalizarResultado();
    }
  }

  entrarChat(numMesa: string) {
    localStorage.setItem('numeroMesa', numMesa);
    this.isModalOpen = false;
    this.duService.setOpenModal = false;
    setTimeout(() => {
      this.router.navigateByUrl('/chat', { replaceUrl: true });
    }, 10);
  }

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
      this.mesas.forEach(mesa => {
        const storage = getStorage();
        const storageRef = ref(storage, ("mesas/" + mesa.foto));
        getDownloadURL(storageRef).then((response) => {
          mesa.foto = response;
        });
      })
    });
  }

  AnalizarResultado() {
    var flag = false;
    this.mesas.forEach(mesa => {
      if (mesa.qr === this.result) {
        flag = true;
        this.numMesa = mesa.numMesa;
        localStorage.setItem('numeroMesa', this.numMesa);
      }
    });

    if (flag) {
      this.spinner = true;
      localStorage.setItem('back', '0');
      this.router.navigateByUrl('/listado-productos', { replaceUrl: true });
    } else {
      this.Alerta("Código no válido", 'danger');
      if (this.volumenOn) {
        this.utilidades.SonidoError();
      }
      this.utilidades.VibrarError();
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
    await toast.present();
  }

  stopScan() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  volver() {
    this.isModalOpen = false;
    this.duService.setOpenModal = false;
  }

  TraerPedidos() {
    this.subPedidos = this.authService.traerPedidos().subscribe(pedidos => {
      this.cantPedidos = 0;
      this.pedidos = pedidos;
      for (var i = 0; i < this.pedidos.length; i++) {
        if (this.pedidos[i].estado.includes("Enviado") || this.pedidos[i].estado.includes("Preparado")) {
          this.cantPedidos = this.cantPedidos + 1;
        }
      }
      this.spinner = false;
    });
  }

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
    }, 7000);
  }

  ActivarDesactivarSonido() {
    if (this.volumenOn) {
      this.volumenOn = false;
      localStorage.setItem('sonido', "No");
    } else {
      this.volumenOn = true;
      localStorage.setItem('sonido', "Si");
    }
  }

  SonidoEgreso() {
    if (this.volumenOn) {
      this.utilidades.PlayLogout();
    }
    localStorage.clear();
  }

  ActivarSpinner() {
    this.spinner = true;
  }

  CerrarSesion() {
    this.ActivarSpinner();
    this.subUsers.unsubscribe();
    setTimeout(() => {
      this.authService.logout();
      this.pnService.eliminarToken(this.idFieldToken);
    }, 1000);
    setTimeout(() => {
      this.SonidoEgreso();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }, 2000);
  }

  VerPedidos() {
    this.spinner = true;
    this.router.navigateByUrl('/mozo-ver-pedido', { replaceUrl: true });
  }

}