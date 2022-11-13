import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DataService } from '../services/data.service';
import { DbService } from '../services/db.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-own-list',
  templateUrl: './own-list.page.html',
  styleUrls: ['./own-list.page.scss'],
})
export class OwnListPage implements OnInit {
  fotos: any[] = [];
  votoUsuario: any[] = [];
  usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  subFotos: Subscription;
  subBackBtn: Subscription;

  constructor(private dbService: DbService, private dataService: DataService, private platform: Platform, private router: Router) { }

  ngOnInit() {
    this.subFotos = this.dbService.obtenerDatosOrden('fotos', 'fecha').pipe(
      map(respuestas => {
        return respuestas.map((resp: any) => {
          const foto = resp.payload.doc.data();
          foto.idDB = resp.payload.doc.id
          return foto;
        })
      })
    ).subscribe(respuesta => {
      while (this.fotos.length > 0) { this.fotos.pop() }
      this.dataService.tipo$.subscribe(tipo => {
        respuesta.forEach((foto: any) => {
          if (foto.tipo == tipo && foto.uidAutor == this.usuarioActual.uid) {
            this.fotos.push(foto);
          }
        });
      })
    })
    this.subBackBtn = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('menu')
    })
  }

  ngOnDestroy() {
    this.subBackBtn.unsubscribe();
    this.subFotos.unsubscribe();
  }
}
