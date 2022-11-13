import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DataService } from '../services/data.service';
import { DbService } from '../services/db.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  fotos: any[] = [];
  votoUsuario: any[] = [];
  usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  subFotos: Subscription;
  subBackBtn: Subscription;
  @ViewChildren('li') li: QueryList<ElementRef>;

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
          if (foto.tipo == tipo) {
            this.fotos.push(foto);
          }
        });
      })
    })
    this.subBackBtn = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('menu')
    })
  }

  ngAfterViewInit() {
    this.li.changes.subscribe(() => {
      this.cargarBotones();
    })
  }

  ngOnDestroy() {
    this.subBackBtn.unsubscribe();
    this.subFotos.unsubscribe();
  }

  cargarBotones() {
    this.fotos.forEach((foto, indice) => {
      const img = document.createElement('img');
      if (foto.votos.length == 0) {
        img.src = '../../assets/images/check.png';
      }
      else {
        for (let uid of foto.votos) {
          if (uid == this.usuarioActual.uid) {
            img.src = '../../assets/images/check-color.png';
            break;
          } else {
            img.src = '../../assets/images/check.png';
          }
        }
      }
      img.width = 50;
      document.getElementById(`boton${indice}`).appendChild(img);
    })
  }

  votar(idFoto: string, indice: number) {
    const foto = this.fotos.find(el => el.id == idFoto);
    if (foto.votos.length == 0) {
      document.getElementById(`boton${indice}`).firstElementChild.setAttribute('src', '../../assets/images/check-color.png');
      foto.votos.push(this.usuarioActual.uid);
      this.dbService.modificarDatos(foto, 'fotos', foto.idDB);
    } else {
      let entro = false;
      foto.votos.forEach(uid => {
        if (uid == this.usuarioActual.uid) {
          document.getElementById(`boton${indice}`).firstElementChild.setAttribute('src', '../../assets/images/check.png');
          foto.votos = foto.votos.filter(e => e != uid);
          this.dbService.modificarDatos(foto, 'fotos', foto.idDB);
          entro = true;
        }
      });
      if (!entro) {
        document.getElementById(`boton${indice}`).firstElementChild.setAttribute('src', '../../assets/images/check-color.png');
        foto.votos.push(this.usuarioActual.uid);
        this.dbService.modificarDatos(foto, 'fotos', foto.idDB);
      }
    }
  }
}
