import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-numeros',
  templateUrl: './numeros.component.html',
  styleUrls: ['./numeros.component.scss'],
})
export class NumerosComponent implements OnInit {
  @Input() idioma: string;

  constructor() { }

  ngOnInit() { }

  reproducirSonido(numero: number) {
    switch (this.idioma) {
      case 'español':
        new Audio(`../../../assets/audio/numeros/esp/${numero}.mp3`).play();
        break;
      case 'portugues':
        new Audio(`../../../assets/audio/numeros/por/${numero}.mp3`).play();
        break;
      case 'ingles':
        new Audio(`../../../assets/audio/numeros/ing/${numero}.mp3`).play();
    }
  }
}
