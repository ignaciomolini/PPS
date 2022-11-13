import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthService, EncuestaCliente, EncuestaEmpleado, Usuario } from '../services/auth.service';
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
  selector: 'app-resultados-encuestas-empleado',
  templateUrl: './resultados-encuestas-empleado.page.html',
  styleUrls: ['./resultados-encuestas-empleado.page.scss'],
})
export class ResultadosEncuestasEmpleadoPage implements OnInit, OnDestroy {
  encuestas: EncuestaEmpleado[];
  usuarios: Usuario[];
  spinner: boolean = true;
  modal: boolean = false;
  grafico: boolean = false;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  chartTypePie: ChartType = 'pie';
  chartOptionsPie: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#000000',
          boxPadding: 2,
          font: {
            size: 15,
            weight: 'bold'
          }
        }
      },
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          size: 20,
          weight: 700
        }
      }
    },
    borderColor: '#000000',
    datasets: {
      pie: {
        backgroundColor: ["rgba(255, 114, 96, 0.6)", "rgba(111, 200, 206, 0.6)", "rgba(250, 255, 242, 0.6)", "rgba(255, 252, 196, 0.6)", "rgba(185, 232, 224, 0.6)"],
        hoverBackgroundColor: ["rgba(255, 114, 96, 1)", "rgba(111, 200, 206, 1)", "rgba(250, 255, 242, 1)", "rgba(255, 252, 196, 1)", "rgba(185, 232, 224, 1)"],
        hoverBorderColor: '#000000'
      }
    }
  };
  pieChartPlugins = [
    DataLabelsPlugin
  ];
  chartDataPie: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        borderRadius: 5,
        borderWidth: 1
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
      this.subEncuestas = this.authService.traerEncuestaEmpleado().subscribe((e: EncuestaEmpleado[]) => {
        this.encuestas = e;
        this.encuestas.forEach(async (enc, i) => {
          const storage = getStorage();
          const storageRef1 = ref(storage, ("encuestaempleado/" + enc.foto1));
          enc.foto1 = await getDownloadURL(storageRef1);
          if (i + 1 == this.encuestas.length) {
            this.spinner = false;
          }
        })
        if (e.length == 0) {
          this.spinner = false;
        }
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
    this.cargarGraficoPie();
  }

  volver() {
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  volverModal() {
    this.modal = false;
    this.grafico = false;
  }

  cargarGraficoPie() {
    this.chartDataPie.labels = [];
    this.chartDataPie.datasets[0].data = [];
    let sumaAmbiente = 0;
    let sumaOrden = 0;
    let sumaLimpieza = 0;
    let sumaCocina = 0;
    let sumaBanios = 0;
    this.encuestas.forEach(encuesta => {
      sumaAmbiente += Number(encuesta.ambiente);
      sumaOrden += Number(encuesta.orden);
      sumaLimpieza += Number(encuesta.limpieza);
      sumaCocina += Number(encuesta.estadoCocina);
      sumaBanios += Number(encuesta.estadoBanios);
    })
    const promedios = [
      { nombre: 'Ambiente laboral', promedio: sumaAmbiente / this.encuestas.length },
      { nombre: 'Orden', promedio: sumaOrden / this.encuestas.length },
      { nombre: 'Limpieza de pisos', promedio: sumaLimpieza / this.encuestas.length },
      { nombre: 'Estado cocina', promedio: sumaCocina / this.encuestas.length },
      { nombre: 'Estado baños', promedio: sumaBanios / this.encuestas.length }
    ]
    promedios.forEach(promedio => {
      this.chartDataPie.labels?.push(promedio.nombre);
      this.chartDataPie.datasets[0].data.push(parseFloat(promedio.promedio.toFixed(2)));
    })
    this.chart?.update();
    setTimeout(() => {
      this.grafico = true;
    }, 100);
  }
}
