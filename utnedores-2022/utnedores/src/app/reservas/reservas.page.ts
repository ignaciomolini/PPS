import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilidadesService } from '../services/utilidades.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit {

  spinner = false;
  volumenOn = true;
  
  constructor(
    private router: Router,
    private utilidades: UtilidadesService
  ) { 
    this.Sonido();
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

  ngOnInit() {
  }

  Volver(){
    this.spinner = true;
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
