import { Component, ViewChild, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  tema: string = 'animales';
  idioma: string = 'español';
  @ViewChild('imgTema') imgTema: ElementRef;
  @ViewChild('imgIdioma') imgIdioma: ElementRef;

  constructor(private authService: AuthService, private router: Router) { }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('login')
  }

  cambiarTema(nuevoTema: string) {
    this.tema = nuevoTema;
    this.imgTema.nativeElement['src'] = `../../assets/images/temas/${nuevoTema}.png`
  }

  cambiarIdioma(nuevoIdioma: string) {
    this.idioma = nuevoIdioma;
    switch (nuevoIdioma) {
      case 'español':
        this.imgIdioma.nativeElement['src'] = '../../assets/images/idiomas/argentina.png';
        break;
      case 'portugues':
        this.imgIdioma.nativeElement['src'] = '../../assets/images/idiomas/brasil.png';
        break;
      case 'ingles':
        this.imgIdioma.nativeElement['src'] = '../../assets/images/idiomas/estados-unidos.png';
    }
  }
}
