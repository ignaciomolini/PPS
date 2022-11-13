import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Espera, Mesa } from '../services/auth.service';
import { getDownloadURL } from '@angular/fire/storage';
import { getStorage, ref } from "firebase/storage";
import { IonContent } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-espera',
  templateUrl: './lista-espera.page.html',
  styleUrls: ['./lista-espera.page.scss'],
})

export class ListaEsperaPage implements OnInit, OnDestroy  {

  volumenOn = true;
  listado: Espera[];
  mesas: Mesa [];
  hayEnEspera = true;
  spinner = false;
  isModalOpen = false;
  mesaSeleccionada = [];
  idFieldEliminar = "0";
  idUsuarioAsignar = "0";
  cantidadComensales = 0;
  cantidadSeleccionada = 0;
  asignar = false;
  mensajeLugares = "";
  eliminarEspera = false;
  subListaEspera: Subscription;
  subMesas: Subscription;

  @ViewChild(IonContent) content: IonContent;

  constructor(
    private toastController: ToastController,
    public router: Router ,
    private authService: AuthService,
    private utilidades: UtilidadesService
  ) { 
    for(var i = 0 ; i < 20; i++){
      this.mesaSeleccionada.push(false);
    }
    this.ActivarSpinner();
    this.Sonido();
    this.TraerListaEspera();
    this.TraerMesas();
    this.ValidarEnEspera();
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

  ngOnDestroy(){
    this.subMesas.unsubscribe();
    this.subListaEspera.unsubscribe();
  }

  EliminarEspera(idField: string){
    this.idFieldEliminar = idField;
    this.eliminarEspera = true;
  }

  AceptarEliminarEspera(){
    this.authService.eliminarEspera(this.idFieldEliminar);
    this.eliminarEspera = false;
    this.Alerta("Espera Eliminada!", 'success');
    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
  }

  CancelarEliminarEspera(){
    this.eliminarEspera = false;
  }

  TraerListaEspera(){
    this.subListaEspera = this.authService.listaEspera().subscribe(lista => {
        this.listado = lista;

        this.listado.forEach(u => {
          const storage = getStorage();
          const storageRef = ref(storage, ("usuarios/" + u.foto));

          getDownloadURL(storageRef).then((response) => {
            u.foto = response;
          });
        });

        for(var i = 0 ; i < this.listado.length - 1; i++){
          for(var k = i + 1 ; k < this.listado.length; k++){
            if((Number(this.listado[i].idEspera)) > (Number(this.listado[k].idEspera))){
              var esperaAux = this.listado[i];
              this.listado[i] = this.listado[k];
              this.listado[k] = esperaAux;
            }
          }
        }

    });
    setTimeout(() => {
    }, 4000);
  }

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;

      this.mesas.forEach(u => {
        const storage = getStorage();
        const storageRef = ref(storage, ("mesas/" + u.foto));

        getDownloadURL(storageRef).then((response) => {
          u.foto = response;
        });
      });

      for(var i = 0 ; i < this.mesas.length - 1; i++){
        for(var k = i + 1 ; k < this.mesas.length; k++){
          if((Number(this.mesas[i].numMesa)) > (Number(this.mesas[k].numMesa))){
            var mesaAux = this.mesas[i];
            this.mesas[i] = this.mesas[k];
            this.mesas[k] = mesaAux;
          }
        }
      }

    });
    setTimeout(() => {
    }, 4000);
  }

  ngOnInit() {

  }

  ActivarSpinner() {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
    }, 5000);
  }

  ValidarEnEspera() {
    setTimeout(() => {
      this.listado.length > 0 ? this.hayEnEspera = true : this.hayEnEspera = false;
    }, 4500);
  }

  Volver() {
    this.spinner = true;
    this.isModalOpen = false;
    setTimeout(() => {
      this.router.navigateByUrl('/home-metre', { replaceUrl: true });
    }, 1000);
  }

  setOpen(cantPersonas: string, idField: string, idUsuario: string) {
    this.cantidadComensales = Number(cantPersonas);
    this.idFieldEliminar = idField;
    this.idUsuarioAsignar = idUsuario;
    for(var i = 0 ; i < this.mesaSeleccionada.length; i++){
      this.mesaSeleccionada[i] = false;
    }
    this.cantidadSeleccionada = 0;
    this.isModalOpen = true;
  }

  back(){
    this.isModalOpen = false;
    this.content.scrollToTop(500);
  }

  SeleccionarMesa(mesa: number, cant:string) { 
    if(this.mesaSeleccionada[mesa]){
      this.mesaSeleccionada[mesa] = false;
      this.cantidadSeleccionada = this.cantidadSeleccionada - Number(cant);
    }else{
      this.mesaSeleccionada[mesa] = true;
      this.cantidadSeleccionada = this.cantidadSeleccionada + Number(cant);
    }
  }

  AsignarMesas(){
    if(this.cantidadComensales == this.cantidadSeleccionada){
      this.mensajeLugares = "Todo listo!";
    }
    if(this.cantidadComensales < this.cantidadSeleccionada){
      var resta = this.cantidadSeleccionada - this.cantidadComensales;
      if(resta == 1){
        this.mensajeLugares = "Sobra 1 lugar!";
      }else{
        this.mensajeLugares = "Sobran " + resta.toString() + " lugares!";
      }
    }

    if(this.cantidadComensales > this.cantidadSeleccionada){
      var resta = this.cantidadComensales - this.cantidadSeleccionada;
      if(resta == 1){
        this.mensajeLugares = "Falta 1 lugar!";
      }else{
        this.mensajeLugares = "Faltan " + resta.toString() + " lugares!";
      }
    }

    this.asignar = true;
  }

  DesactivarSpinner(){
    setTimeout(() => {
      this.spinner = false;
    }, 11000);
  }

  async Alerta(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  async AceptarAsignar(){
    this.asignar = false;
    this.isModalOpen = false;
    this.spinner = true;
    this.DesactivarSpinner();
    this.authService.eliminarEspera(this.idFieldEliminar);
    
    var listadoMesasAsignar = [];
    for(var i = 0 ; i < this.mesaSeleccionada.length; i++){      

      if(this.mesaSeleccionada[i]){
        
        this.mesas.forEach(m => {
          if(Number(m.numMesa) == i){
            listadoMesasAsignar.push(m.idField);
          }
        });
      }
    }
    await new Promise(f => setTimeout(f, 1500));
    for(var i = 0 ; i < listadoMesasAsignar.length; i++){
      this.AsignarMesa(listadoMesasAsignar[i], this.idUsuarioAsignar);
      await new Promise(f => setTimeout(f, 3000));
    }
    this.isModalOpen = false;
    this.spinner = false;

    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
    this.Alerta("Asignación exitosa!", 'success');
    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
  }

  async AsignarMesa(idField: string, idUsuario: string){
    this.authService.asignarMesa(idField, idUsuario);
  }

  
  CancelarAsignar(){
    this.asignar = false;
  }

}
