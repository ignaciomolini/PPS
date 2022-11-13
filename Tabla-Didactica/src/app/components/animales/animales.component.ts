import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-animales',
  templateUrl: './animales.component.html',
  styleUrls: ['./animales.component.scss'],
})
export class AnimalesComponent implements OnInit {
  @Input() idioma: string;

  constructor() { }

  ngOnInit() { }

  reproducirSonido(animal: string) {
    switch (this.idioma) {
      case 'español':
        new Audio(`../../../assets/audio/animales/esp/${animal}.mp3`).play();
        break;
      case 'portugues':
        new Audio(`../../../assets/audio/animales/por/${animal}.mp3`).play();
        break;
      case 'ingles':
        new Audio(`../../../assets/audio/animales/ing/${animal}.mp3`).play();
    }
  }
}
