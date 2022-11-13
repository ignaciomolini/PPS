import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { DbService } from '../services/db.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss'],
})
export class ChartPage implements OnInit {
  tipo: string;
  subBackBtn: Subscription;
  subFotos: Subscription;

  constructor(private dataService: DataService, private dbService: DbService, private platform: Platform,
    private router: Router) { }

  ngOnInit() {
    this.subFotos = this.dbService.obtenerDatos('fotos').subscribe((fotos: any) => {
      this.dataService.tipo$.subscribe(tipo => {
        this.tipo = tipo;
        this.dataService.setFotos = fotos.filter(foto => foto.tipo == tipo);
      })
    });
    this.subBackBtn = this.platform.backButton.subscribe(() => {
      this.router.navigateByUrl('menu')
    })
  }

  ngOnDestroy() {
    this.subBackBtn.unsubscribe();
    this.subFotos.unsubscribe();
  }
}
