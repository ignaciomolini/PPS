import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, Mesa } from '../services/auth.service';
import { SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
})
export class AltaMesaPage implements OnInit, OnDestroy {

  volumenOn = true;
  formMesa: FormGroup;
  mesas: Mesa[];
  numMesa = "0";
  mostrarQr = false;
  public myAngularxQrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  file: File;
  tipos: string[] = [
    "Estándar",
    "Discapacitados",
    "VIP"];
  mesaPhoto = "../../assets/table-photo.png";
  spinner = false;
  fotosLleno = false;
  nombreFoto = "";
  subMesa: Subscription;

  mesaAgregado = false;
  
  constructor(
    private toastController: ToastController,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private utilidades: UtilidadesService
  ) {
    this.Sonido();
    this.AsignarNombreFotos();
    this.TraerMesas();
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

  }

  Volver(){
    this.spinner = true;
    this.Redirigir();
  }

  Redirigir(){
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  ngOnInit() {
    this.formMesa = this.fb.group(
      {
        tipo: ['', [Validators.required]],
        capacidad: ['', [Validators.required, Validators.pattern('^([0-9])*$'), Validators.minLength(1), Validators.maxLength(2)]]
      }
    )
  }

  get tipo() {
    return this.formMesa.get('tipo');
  }

  get capacidad() {
    return this.formMesa.get('capacidad');
  }

  LimpiarFoto() {
    this.mesaPhoto = "../../assets/table-photo.png";
    this.fotosLleno = false;
    this.file = null;
  }

  Caracteres(dato: string) {
    var retorno = dato.toString();
    if (dato.length == 1) {
      retorno = "0" + retorno;
    }
    return retorno;
  }

  AsignarNombreFotos() {
    var date = new Date();
    this.nombreFoto = date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
  }

  TraerMesas() {
    this.subMesa = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
      this.AsignarNumeroMesa();
    });
  }

  AsignarImagen() {
    var readerVar = new FileReader();
    readerVar.readAsDataURL(this.file);
    readerVar.onload = (_event) => {
      this.mesaPhoto = (readerVar.result).toString();
    }
  }

  Cargar(event: any): void {
    this.file = event.target.files[0];
    this.AsignarImagen();
    this.fotosLleno = true;
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

  AsignarNumeroMesa() {
    for (var i = 0; i < this.mesas.length; i++) {
      if (Number(this.numMesa) < Number(this.mesas[i].numMesa)) {
        this.numMesa = this.mesas[i].numMesa;
      }
    }
    this.numMesa = (Number(this.numMesa) + 1).toString();
    this.myAngularxQrCode = "MESA" + this.numMesa;
    this.mostrarQr = true;
    this.subMesa.unsubscribe();
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  Fotos() {
    (<HTMLInputElement>document.getElementById('inputFiles')).click();
  }

  DesactivarVentanas(){
    setTimeout(()=>{
      this.spinner = false;
      this.mesaAgregado = false;
    },12000);
  }

  AgregarMesa() {
    this.spinner = true;
    this.DesactivarVentanas();
    if (this.numMesa == "0") {
      this.spinner = false;
      this.Alerta("Ocurrió un error! Reintentar", 'danger');
      if(this.volumenOn){
        this.utilidades.SonidoError();
      }
      this.utilidades.VibrarError();
      this.TraerMesas();
    }
    else {
      var unaMesa: Mesa = {
        idField: "",
        numMesa: this.numMesa,
        qr: this.myAngularxQrCode,
        capacidad: this.capacidad.value,
        tipo: this.tipos[this.tipo.value],
        foto: this.nombreFoto,
        idMozo: "0",
        idUsuario: "0",
        cuenta: "0",
        pedirCuenta: "No"
      };
      this.authService.addTable(unaMesa);
      setTimeout(() => {
        var imagenStorage = "mesas/" + this.nombreFoto;
        this.authService.subirImagenFile(imagenStorage, this.file);
        this.spinner = false;
        this.mesaAgregado = true;
        if(this.volumenOn){
          this.utilidades.SonidoAlta();
        }
        setTimeout(() => {
          this.Redirigir();
        }, 2500);
      }, 3000);
    }
  }
}