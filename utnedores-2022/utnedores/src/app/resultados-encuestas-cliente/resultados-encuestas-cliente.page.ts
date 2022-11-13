import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthService, EncuestaCliente, Usuario } from '../services/auth.service';
import { getDownloadURL } from '@angular/fire/storage';
import { getStorage, ref } from "firebase/storage";
import { Router } from '@angular/router';
import { ChartData } from 'chart.js';
import { ChartConfiguration } from 'chart.js';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resultados-encuestas-cliente',
  templateUrl: './resultados-encuestas-cliente.page.html',
  styleUrls: ['./resultados-encuestas-cliente.page.scss'],
})
export class ResultadosEncuestasClientePage implements OnInit, OnDestroy {
  encuestas: EncuestaCliente[];
  usuarios: Usuario[];
  spinner: boolean = true;
  modal: boolean = false;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  chartTypeBar: ChartType = 'bar';
  chartOptionsBar: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'x',
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          color: '#000000',
          font: {
            size: 18,
            weight: 'bold'
          }
        }
      },
      y: {
        ticks: {
          color: '#000000',
          font: {
            size: 18,
            weight: 'bold'
          },
          stepSize: 1
        },
        max: 5 
      }
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        color: '#000000',
        font: {
          size: 20,
          weight: 'bold'
        }
      }
    },
    datasets: {
      bar: {
        backgroundColor: ["rgba(255, 114, 96, 0.6)", "rgba(111, 200, 206, 0.6)", "rgba(250, 255, 242, 0.6)", "rgba(255, 252, 196, 0.6)", "rgba(185, 232, 224, 0.6)"],
        hoverBackgroundColor: ["rgba(255, 114, 96, 1)", "rgba(111, 200, 206, 1)", "rgba(250, 255, 242, 1)", "rgba(255, 252, 196, 1)", "rgba(185, 232, 224, 1)"],
        hoverBorderColor: '#000000'
      }
    }
  };
  barChartPlugins = [
    DataLabelsPlugin
  ];
  chartDataBar: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: '#000000',
        borderWidth: 2,
        borderRadius: 5
      }
    ]
  };

  subUsers: Subscription;
  subEncuestas: Subscription;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.subUsers = this.authService.getUsers().subscribe((u: Usuario[]) => {
      this.usuarios = u;
      this.subEncuestas = this.authService.traerEncuestaCliente().subscribe((e: EncuestaCliente[]) => {
        this.encuestas = e;
        this.encuestas.forEach(async (enc, i) => {
          const storage = getStorage();
          const storageRef1 = ref(storage, ("encuestas/" + enc.foto1));
          const storageRef2 = ref(storage, ("encuestas/" + enc.foto2));
          const storageRef3 = ref(storage, ("encuestas/" + enc.foto3));
          enc.foto1 = await getDownloadURL(storageRef1);
          enc.foto2 = await getDownloadURL(storageRef2);
          enc.foto3 = await getDownloadURL(storageRef3);
          if (i + 1 == this.encuestas.length) {
            this.spinner = false;
          }
        })
      })
    })
  }

  ngOnDestroy(){	
    this.subUsers.unsubscribe();
    this.subEncuestas.unsubscribe();
  }

  traerNombre(id: string) {
    let nombre = '';
    this.usuarios.forEach((u: Usuario) => {
      if (u.idUsuario == id) {
        nombre = `${u.nombre} ${u.apellido}`;
      }
    })
    return nombre;
  }

  abrirEstadisticas() {
    this.modal = true;
    this.cargarGraficoBar();
  }

  volver() {
    this.router.navigateByUrl('/home-cliente', { replaceUrl: true });
  }

  volverModal() {
    this.modal = false;
  }

  cargarGraficoBar() {
    this.chartDataBar.labels = [];
    this.chartDataBar.datasets[0].data = [];
    let sumaAtencion = 0;
    let sumaAmbiente = 0;
    let sumaOrden = 0;
    let sumaLimpieza = 0;
    let sumaRapidez = 0;
    this.encuestas.forEach(encuesta => {
      sumaAtencion += Number(encuesta.atencion);
      sumaAmbiente += Number(encuesta.ambiente);
      sumaOrden += Number(encuesta.precioCalidad);
      sumaLimpieza += Number(encuesta.limpieza);
      sumaRapidez += Number(encuesta.rapidez);
    })
    const promedios = [
      { nombre: 'Atención', promedio: sumaAtencion / this.encuestas.length },
      { nombre: 'Ambiente', promedio: sumaAmbiente / this.encuestas.length },
      { nombre: 'Precio calidad', promedio: sumaOrden / this.encuestas.length },
      { nombre: 'Limpieza', promedio: sumaLimpieza / this.encuestas.length },
      { nombre: 'Rapidez', promedio: sumaRapidez / this.encuestas.length }
    ]
    promedios.forEach(promedio => {
      this.chartDataBar.labels?.push(promedio.nombre);
      this.chartDataBar.datasets[0].data.push(parseFloat(promedio.promedio.toFixed(2)));
      this.chart?.update();
    })
  }
}
