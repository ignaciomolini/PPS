import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { IonicModule } from '@ionic/angular';
import { ChartPageRoutingModule } from './chart-routing.module';
import { ChartPage } from './chart.page';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartPageRoutingModule,
    NgChartsModule
  ],
  declarations: [
    ChartPage,
    PieChartComponent,
    BarChartComponent
  ]
})
export class ChartPageModule { }
