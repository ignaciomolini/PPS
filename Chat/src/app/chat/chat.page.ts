import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Mensaje } from '../interfaces/mensaje';
import { DataService } from '../services/data.service';
import { DbService } from '../services/db.service';
import { Subscription } from 'rxjs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  nuevoMensaje: string = '';
  mostrarChat: boolean = false;
  formMsj: FormGroup;
  subChat: Subscription;
  subCajaMsj: Subscription;
  curso: string;
  chat: Mensaje[];
  usuarioActual: any;
  @ViewChildren('cajaMsj') cajaMsj: QueryList<ElementRef>;

  constructor(private dbService: DbService, private dataService: DataService, private cdref: ChangeDetectorRef, private fb: FormBuilder, private platform: Platform, private router: Router) {
  }

  ngOnInit(): void {
    this.usuarioActual = JSON.parse(localStorage.getItem('usuario'))
    this.dataService.curso$.subscribe(curso => {
      this.curso = curso;
    }).unsubscribe();
    this.subChat = this.dbService.cargarMensajes(`chat-${this.curso}`).subscribe((mensajes: Mensaje[]) => {
      this.chat = mensajes;
    });
    this.formMsj = this.fb.group(
      {
        mensaje: ['', [Validators.maxLength(21)]]
      }
    )
    this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('home')
    });
  }

  get mensaje() {
    return this.formMsj.get('mensaje');
  }

  ngAfterViewInit(): void {
    this.subCajaMsj = this.cajaMsj.changes
      .subscribe(() => {
        this.cajaMsj.forEach(el => {
          if (el.nativeElement.id == this.usuarioActual.uid) {
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
  }

  bgMsjPropio(uid: string) {
    if (this.usuarioActual.uid == uid && this.curso == 'pps-4a') {
      return 'caja-msj-propio-4a';
    } else if (this.usuarioActual.uid == uid && this.curso == 'pps-4b') {
      return 'caja-msj-propio-4b';
    }
  }

  enviarMensaje() {
    const mensaje = this.formMsj.value.mensaje
    if (mensaje.length === 0) return;
    this.dbService.agregarMensaje(mensaje, this.usuarioActual.nombre, this.usuarioActual.uid);
    this.formMsj.reset();
  }

}
