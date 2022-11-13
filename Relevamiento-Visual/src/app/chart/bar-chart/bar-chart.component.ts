import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import Swal from 'sweetalert2';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { BaseChartDirective } from 'ng2-charts';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  fotos: any[] = [];
  fotosConVotos: any[] = [];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  chartType: ChartType = 'bar';
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          color: '#22577A',
          font: {
            size: 18,
            weight: 'bold'
          },
          callback: (function(value:any){if (value % 1 === 0) {return value;}})
        }
      },
      y: {
        ticks: {
          color: '#22577A',
          font: {
            size: 18,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        color: '#22577A',
        font: {
          size: 20,
          weight: 'bold'
        }
      }
    },
  };
  barChartPlugins = [
    DataLabelsPlugin
  ];
  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: '#22577A',
        borderWidth: 2,
        borderRadius: 5
      }
    ]
  };

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.fotos$.subscribe(fotos => {
      this.fotos = fotos;
      this.cargarGrafico();
    }).unsubscribe();
    this.fotosConVotos = this.fotos.filter(el => el.votos.length > 0);
  }

  chartClicked(event) {
    const foto = this.fotosConVotos[event.active[0].index];
    const fecha = new Date(foto.fecha).toLocaleString(`en-US`);
    Swal.fire({
      html:
        '<div class="card card-chart" [class.mt-2]="i == 0">' +
        '<div class="marco-chart">' +
        '<ion-spinner name="lines" color="light" class="spin-chart"></ion-spinner>' +
        `<img src="${foto.ruta}" />` +
        '</div>' +
        '<div class="card-body card-body-chart">' +
        '<ul class="list-group text-center">' +
        `<li class="list-group-item list-group-item-chart">Autor: &nbsp;${foto.autor}</li>` +
        '<li class="list-group-item list-group-item-chart">' +
        `Descripción: &nbsp;${foto.descripcion}` +
        '</li>' +
        '<li class="list-group-item list-group-item-chart">' +
        `Fecha: &nbsp;${fecha}` +
        '</li>' +
        '<li class="list-group-item list-group-item-chart">' +
        `Cantidad de votos: &nbsp;<span>${foto.votos.length}</span>` +
        '</li>' +
        '</ul>' +
        '</div>' +
        '</div>',
      heightAuto: false,
      allowOutsideClick: true,
      showConfirmButton: false,
      showClass: {
        backdrop: 'backdrop'
      }
    })
  }

  cargarGrafico() {
    this.chartData.labels = [];
    this.chartData.datasets[0].data = [];
    this.fotos.forEach(foto => {
      if (foto.votos.length > 0) {
        this.chartData.labels?.push(foto.autor);
        this.chartData.datasets[0].data.push(foto.votos.length);
      }
      this.chart?.update();
    })  
  }

}
