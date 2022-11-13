import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, Mensaje, Usuario } from '../services/auth.service';
import { Chat, ChatService } from '../services/chat.service';
import { DataUsuarioService } from '../services/data-usuario.service';
import { UtilidadesService } from '../services/utilidades.service';
import { PushNotificationService } from '../services/push-notification.service';
import { Unsubscribe } from '@angular/fire/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {

  volumenOn = true;
  chat: Chat = { numMesa: '0', idField: '0', leido: false, mensajes: [] };
  numMesa: string;
  spinner: boolean = true;
  formMsj: FormGroup;
  subChat: Subscription;
  subCajaMsj: Subscription;
  usuarioActual: Usuario;
  idUsuarioPedido: string;
  users: Usuario[];
  flagToken = true;
  subUsers: Subscription;
  sub: Unsubscribe;

  @ViewChildren('cajaMsj') cajaMsj: QueryList<ElementRef>;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private fb: FormBuilder,
    private dataUsuarioService: DataUsuarioService,
    private cdref: ChangeDetectorRef,
    private utilidades: UtilidadesService,
    private router: Router,
    private pnService: PushNotificationService
  ) {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
    }, 5000);
    this.Sonido();
    this.TraerUsuarios();
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

  TraerUsuarios() {
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
      this.users = allUsers;
      this.spinner = false;
    });
  }

  ngOnInit(): void {
    this.numMesa = localStorage.getItem('numeroMesa');
    this.formMsj = this.fb.group(
      {
        mensaje: [{ value: '', disabled: true }, [Validators.maxLength(30)]]
      }
    )
    this.sub = this.authService.obtenerAuth().onAuthStateChanged(user => {
      this.authService.getUser(user.email).then((user: Usuario) => {
        this.usuarioActual = user;
        this.subChat = this.chatService.cargarChatMesa('chats', this.numMesa).subscribe((chat: Chat[]) => {
          if (chat[0] != undefined) {
            this.chat = chat[0];
            console.log(this.chat);
          }
          this.mensaje.enable();
          this.spinner = false;
        });
      });
    })
  }

  volver() {
    if (this.usuarioActual.tipo == "Mozo") {
      this.router.navigateByUrl('/home-mozo', { replaceUrl: true });
    } else {
      this.router.navigateByUrl('/home-cliente-mesa', { replaceUrl: true });
    }
  }

  get mensaje() {
    return this.formMsj.get('mensaje');
  }

  ngAfterViewInit(): void {
    this.subCajaMsj = this.cajaMsj.changes
      .subscribe(() => {
        this.cajaMsj.forEach(el => {
          if (el.nativeElement.id == this.usuarioActual.idUsuario) {
            el.nativeElement.classList.add('animacion-derecha');
          } else {
            el.nativeElement.classList.add('animacion-izquierda');
          }
        })
        this.subCajaMsj.unsubscribe();
      });
  }

  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  ngOnDestroy(): void {
    this.subChat.unsubscribe();
    this.subUsers.unsubscribe();
    this.sub();
  }

  bgMsjOpuesto(msj: Mensaje) {
    if (this.usuarioActual.idUsuario != msj.usuario.id) {
      if (msj.usuario.tipo == 'Mozo') {
        return 'caja-msj-mozo';
      } else {
        return 'caja-msj-cliente';
      }
    }
  }

  enviarMensaje() {
    var tokens = [""];
    var flagArrayToken = true;

    if (this.flagToken) {
      this.users.forEach(user => {
        if (user.tipo.includes("Mozo")) {
          if (user.token != "") {
            if (flagArrayToken) {
              flagArrayToken = false;
              tokens[0] = user.token;
            } else {
              tokens.push(user.token);
            }
          }
        }
      });
    }

    const textoMensaje = this.formMsj.value.mensaje;
    const usuario = {
      id: this.usuarioActual.idUsuario, nombre: this.usuarioActual.nombre,
      apellido: this.usuarioActual.apellido, tipo: this.usuarioActual.tipo
    };
    const mensaje = {
      usuario: usuario,
      mensaje: textoMensaje,
      fecha: new Date().getTime()
    }
    if (this.chat.numMesa == "0") {
      const chat = {
        numMesa: this.numMesa,
        leido: false,
        mensajes: [mensaje]
      }
      this.chatService.agregarChat(chat, 'chats')
    } else {
      this.chat.mensajes.push(mensaje);
      const obj = { leido: (this.usuarioActual.tipo == "Mozo"), mensajes: this.chat.mensajes }
      this.chatService.modificarChat(obj, `chats/${this.chat.idField}`);
    }

    if (this.usuarioActual.perfil == "Cliente" && this.flagToken && !flagArrayToken) {
      this.flagToken = false;
      this.pnService.sendPush(tokens, "Consulta Cliente", "Chat Pendiente", { operacion: 'NuevoMensaje' });
    }
    this.formMsj.reset();
  }
}