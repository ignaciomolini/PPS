import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, Producto } from '../services/auth.service';
import { SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.page.html',
  styleUrls: ['./alta-producto.page.scss'],
})
export class AltaProductoPage implements OnInit, OnDestroy {
  
  tipo = "";
  flagAux = true;
  volumenOn = true;
  formProducto: FormGroup;
  bebida = false;
  elab = false;
  spinner = false;
  productos: Producto[];
  numProducto = "0";
  mostrarQr = false;
  nombreFotos: string[] = ["", "", ""];
  files: File[] = [];
  categorias: string[] = [
    "Entradas",
    "Promociones",
    "Platos fríos",
    "Platos calientes",
    "Bebidas sin alcohol",
    "Bebidas con alcohol",
    "Postres y Café-Te"];
  prodPhoto = "../../assets/dessert-photo.png";
  srcProductPhoto: string[] = ["../../assets/dessert-photo.png", "../../assets/dessert-photo.png", "../../assets/dessert-photo.png"];
  fotosLleno = false;
  productoAgregado = false;

  public myAngularxQrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  subProductos: Subscription;

  constructor(
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private utilidades: UtilidadesService
  ) {
    this.tipo = localStorage.getItem('tipoAlta');
    this.Sonido();
    this.TraerProductos();
    this.AsignarNombreFotos();
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

  ngOnInit(): void {
    this.formProducto = this.fb.group(
      {
        categoria: ['', [Validators.required]],
        producto: ['', [Validators.required, Validators.maxLength(25)]],
        descripcion: ['', [Validators.required, Validators.maxLength(40)]],
        tiempoElaboracion: ['', [Validators.required, Validators.pattern('^([0-9])*$'), Validators.minLength(1), Validators.maxLength(3)]],
        tamanio: ['', [Validators.required]],
        precio: ['', [Validators.required, Validators.pattern('^([0-9])*$'), Validators.minLength(1), Validators.maxLength(6)]]
      }
    )
  }

  get categoria() {
    return this.formProducto.get('categoria');
  }

  get producto() {
    return this.formProducto.get('producto');
  }

  get descripcion() {
    return this.formProducto.get('descripcion');
  }

  get tiempoElaboracion() {
    return this.formProducto.get('tiempoElaboracion');
  }

  get tamanio() {
    return this.formProducto.get('tamanio');
  }

  get precio() {
    return this.formProducto.get('precio');
  }

  SelectChange() {
    if (this.categoria.value == 4 || this.categoria.value == 5) {
      this.tamanio?.enable();
      this.tiempoElaboracion?.disable();
      (<HTMLInputElement>document.getElementById('tiempoElab')).value = "";
    } else {
      this.tamanio?.disable();
      this.tiempoElaboracion?.enable();
      (<HTMLInputElement>document.getElementById('tamanio')).value = "";
    }
  }


  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  TraerProductos() {
    this.subProductos = this.authService.getProducts().subscribe(allProducts => {
      this.productos = allProducts;
      this.AsignarNumeroProducto();
    });
  }

  Fotos() {
    (<HTMLInputElement>document.getElementById('inputFiles')).click();
  }

  AsignarNumeroProducto() {
    this.numProducto = "0";
    for (var i = 0; i < this.productos.length; i++) {
      if (Number(this.numProducto) < Number(this.productos[i].idProducto)) {
        this.numProducto = this.productos[i].idProducto;
      }
    }
    this.numProducto = (Number(this.numProducto) + 1).toString();
    this.myAngularxQrCode = "PRODUCTO" + this.numProducto;
    this.mostrarQr = true;
    this.subProductos.unsubscribe();
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
    this.nombreFotos[0] =  date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    setTimeout(() => {
      date = new Date();
      this.nombreFotos[1] = date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    }, 2000);
    setTimeout(() => {
      date = new Date();
      this.nombreFotos[2] = date.getFullYear().toString() + this.Caracteres(date.getMonth().toString()) + this.Caracteres(date.getDate().toString()) + this.Caracteres(date.getHours().toString()) + this.Caracteres(date.getMinutes().toString()) + this.Caracteres(date.getSeconds().toString());
    }, 4000);
  }

  SubirImagenes() {
    setTimeout(() => {
      this.authService.subirImagenFile(("productos/" + this.nombreFotos[0]), this.files[0]);
      setTimeout(() => {
        this.authService.subirImagenFile(("productos/" + this.nombreFotos[1]), this.files[1]);
      }, 3000);
      setTimeout(() => {
        this.authService.subirImagenFile(("productos/" + this.nombreFotos[2]), this.files[2]);
      }, 6000);
    }, 2000);
    
    this.spinner = false;
    this.productoAgregado = true;
    if(this.volumenOn){
      this.utilidades.SonidoAlta();
    }
    setTimeout(() => {
      this.Redirigir();
    }, 2500);
  }

  LimpiarFoto(num: number) {
    this.files[num] = null;
    this.srcProductPhoto[num] = this.prodPhoto;
    this.fotosLleno = false;
  }

  AsignarImagen(indice: number) {
    var readerVar = new FileReader();
    readerVar.readAsDataURL(this.files[indice]);
    readerVar.onload = (_event) => {
      this.srcProductPhoto[indice] = (readerVar.result).toString();
    }
  }

  Cargar(event: any): void {
    var selectFile = event.target.files;
    var num = selectFile.length;
    var cant = 0;
    var indice = 0;

    for (var i = 0; i < this.srcProductPhoto.length; i++) {
      if (this.srcProductPhoto[i].includes(this.prodPhoto)) {
        cant = cant + 1;
      }
    }

    if (num <= cant) {

      if (this.files[0] == null) {
        this.files[0] = event.target.files[indice];
        this.AsignarImagen(0);
        indice = indice + 1;
      }

      if (this.files[1] == null && num >= (indice + 1)) {
        this.files[1] = event.target.files[indice];
        this.AsignarImagen(1);
        indice = indice + 1;
      }

      if (this.files[2] == null && num >= (indice + 1)) {
        this.files[2] = event.target.files[indice];
        this.AsignarImagen(2);
      }
      this.fotosLleno = true;
      this.flagAux = false;

      setTimeout(() => {
        this.flagAux = true;
        for (var i = 0; i < 3; i++) {
          if (this.srcProductPhoto[i].includes(this.prodPhoto)) {
            this.fotosLleno = false;
          }
        }
      }, 1500);
    }
    else {
      if (cant == 1) {
        this.Alerta("Seleccionar 1 imagen", 'warning');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
      } else {
        this.Alerta(("Seleccionar " + cant.toString() + " imágenes"), 'warning');
        if(this.volumenOn){
          this.utilidades.SonidoError();
        }
        this.utilidades.VibrarError();
      }
    }
  }

  async Alerta(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present()
  }

  DesactivarVentanas(){
    setTimeout(()=>{
      this.spinner = false;
      this.productoAgregado = false;
    },13000);
  }

  AgregarProducto() {
    this.spinner = true;
    this.DesactivarVentanas();
    if (this.numProducto == "0") {
      //ERROR
      this.spinner = false
      this.Alerta("Ocurrió un error! Reintentar", 'danger');
      if(this.volumenOn){
        this.utilidades.SonidoError();
      }
      this.utilidades.VibrarError();
      this.TraerProductos();
    }
    else {
      //AGREGAR FOTOS

      var tiempo = "3";

      if((Number(this.categoria.value)) < 4){
        tiempo = (this.tiempoElaboracion.value).toString();
      }

      var unProducto: Producto = {
        idField: "",
        idProducto: this.numProducto,
        categoria: this.categorias[this.categoria.value],
        producto: this.producto.value,
        tamanio: this.tamanio.value,
        descripcion: this.descripcion.value,
        tiempoElaboracion: tiempo,
        foto1: this.nombreFotos[0],
        foto2: this.nombreFotos[1],
        foto3: this.nombreFotos[2],
        precio: this.precio.value,
        qr: this.myAngularxQrCode
      }
      this.formProducto.reset();
      this.srcProductPhoto = ["../../assets/dessert-photo.png", "../../assets/dessert-photo.png", "../../assets/dessert-photo.png"];
      this.fotosLleno = false;
      this.SubirImagenes();
      this.authService.addProduct(unProducto);
    }
  }

  Volver() {
    this.spinner = true;
    this.Redirigir();
  }

  Redirigir(){
    this.router.navigateByUrl('/home-cocina', { replaceUrl: true });
  }
}
