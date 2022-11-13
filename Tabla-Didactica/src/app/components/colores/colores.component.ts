import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-colores',
  templateUrl: './colores.component.html',
  styleUrls: ['./colores.component.scss'],
})
export class ColoresComponent implements OnInit {
  @Input() idioma: string;

  constructor() { }

  ngOnInit() {}

  reproducirSonido(color: string) {
    switch (this.idioma) {
      case 'español':
        new Audio(`../../../assets/audio/colores/esp/${color}.mp3`).play();
        break;
      case 'portugues':
        new Audio(`../../../assets/audio/colores/por/${color}.mp3`).play();
        break;
      case 'ingles':
        new Audio(`../../../assets/audio/colores/ing/${color}.mp3`).play();
    }
  }
}
