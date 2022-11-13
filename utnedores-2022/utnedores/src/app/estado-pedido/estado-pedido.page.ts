import { UtilidadesService } from '../services/utilidades.service';
import { AuthService, Pedido, Producto, Usuario, Mesa, Cuenta } from '../services/auth.service';
import { Router } from '@angular/router';
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL } from '@angular/fire/storage';
import { ToastController } from '@ionic/angular';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Unsubscribe } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-estado-pedido',
  templateUrl: './estado-pedido.page.html',
  styleUrls: ['./estado-pedido.page.scss'],
})

export class EstadoPedidoPage implements OnInit, AfterViewInit, OnDestroy {
  
  cuentas: Cuenta[];
  precioFinal = 0;
  propina = 0;
  propinaSolicitada = false;
  result = null;
  scanActive = false;
  aceptarRadioButton = false;
  solicitarCuenta = false;
  codigoEscaneado = false;
  codigoInvalido = false;
  usuarioActual: Usuario;
  isModalOpen = false;
  pedidos: Pedido[];
  cargando = true;
  spinner = true;
  volumenOn = true;
  hayPedido = false;
  productos: Producto[];
  pedidosVisibles = [];
  valores = ["Excelente", "Muy bueno", "Bueno", "Regular", "Malo"];
  porcentaje = [20, 15, 10, 5, 0]
  formOpinion: FormGroup;
  estadoPedido: string[] = [
    "Enviado",
    "Confirmado",
    "Preparado",
    "Recibido",
    "Rechazado"];
  cantTipoPedido = [];
  cantProductosAgregados = [];
  pedirCuenta = 0;
  permisoPedirCuenta = true;
  mesas: Mesa[];

  precioPagar = 0;
  solicitudEnviada = false;
  confirmarSolicitud = false;
  pedidosPendientes = false;

  pedidoRecibido = false;
  idFieldPedidoActual = "";
  pedidoNum = "0";
  numPedido = "";
  numeroMesa = "0";
  precioTotal = 0;
  tiempoTotal = 0;
  confirmarPedido = false;
  cantidadPorCategoria = [];
  categorias: string[] = [
    "Entradas",
    "Promociones",
    "Platos fríos",
    "Platos calientes",
    "Bebidas sin alcohol",
    "Bebidas con alcohol",
    "Postres y Café-Te"];
  poseePedidosPendientes = false;

  subMesas: Subscription;
  subCuentas: Subscription;
  subPedidos: Subscription;
  subProductos: Subscription;
  sub: Unsubscribe;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private utilidades: UtilidadesService,
    private fb: FormBuilder
  ) { 
    this.pedirCuenta = (Number(localStorage.getItem('pedircuenta')));
    for(var i = 0 ; i < 50; i++){
      if(i < 7){
        this.cantidadPorCategoria.push(0);
      }
      this.cantProductosAgregados.push(0);
      if(i < 5){
        this.cantTipoPedido.push(0);
      }
    }
    this.DesactivarSpinner();
    this.Sonido();
    this.TraerProductos();
    if(this.pedirCuenta == 1){
      this.TraerMesas();
    }
  }

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
    });
  }

  PedidoRecibido(idField: string){
    this.authService.pedidoRecibido(idField);
    this.Alerta("Pedido Recibido!",'success');
    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
  }

  TraerCuentas() {
    this.subCuentas = this.authService.traerCuentas().subscribe(listaCuentas => {
      this.cuentas = listaCuentas;
      this.cuentas.forEach(cuenta => {
        if(cuenta.idUsuario === this.usuarioActual.idUsuario){
          this.permisoPedirCuenta = false;
          this.precioPagar = (Number(cuenta.total));
          this.propina = (Number(cuenta.propina));
          this.precioFinal = this.precioPagar + this.propina;
        }
      });
    });
  }

  ngOnInit(): void {
    this.sub = this.authService.obtenerAuth().onAuthStateChanged(user => {
      this.authService.getUser(user.email).then((user: Usuario) => {
        this.usuarioActual = user;
        this.TraerPedidos();
        if(this.pedirCuenta == 1){
          this.TraerCuentas();
        }
      });
    })
    this.formOpinion = this.fb.group(
      {
        opinion: ['', [Validators.required]],
      }
    )
  }

  get opinion() {
    return this.formOpinion.get('opinion');
  }

  ngAfterViewInit() {
    BarcodeScanner.prepare();
  }

  ngOnDestroy() {
    this.stopScan();
    if(this.pedirCuenta == 1){
      this.subMesas.unsubscribe();
      this.subCuentas.unsubscribe();
    }
    this.subProductos.unsubscribe();
    this.subPedidos.unsubscribe();
    this.sub();
  }

  stopScan()
  {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  VerPedido(index: number, numMesa: string, idField: string){
    this.idFieldPedidoActual = idField;
    this.pedidoNum = (index + 1).toString();
    this.numeroMesa = numMesa;
    this.numPedido = (index + 1).toString();
    
    
    if(this.pedirCuenta == 0){
      this.pedidoRecibido = false;
      if(this.pedidosVisibles[index].estado.includes("Preparado")){
        this.pedidoRecibido = true;
      }
    }
    
    for(var i = 0 ; i < 50; i++){
      this.cantProductosAgregados[i] = 0;
    }

    var pedidoAux = JSON.parse(this.pedidosVisibles[index].productos);

    for(var i = 0 ; i < pedidoAux.length; i++){
      
      for(var k = 0 ; k < this.productos.length ; k++){
        if((Number(this.productos[k].idProducto)) == (Number(pedidoAux[i].idProducto))){
          this.cantProductosAgregados[k] = (Number(pedidoAux[i].cantidad))
          k = this.productos.length;
        }
      }
    }
    this.CantidadPorCategoria();
    this.CalcularPrecio();
    this.CalcularTiempo();
    this.isModalOpen = true;
  }

  CantidadPorCategoria(){
    
    for(var i = 0 ; i < this.categorias.length ; i++){
      this.cantidadPorCategoria[i] = 0;
    }

    for(var i = 0 ; i < this.cantProductosAgregados.length ; i++){
      if(this.cantProductosAgregados[i] > 0){
        for(var k = 0 ; k < this.categorias.length ; k++){
          if(this.categorias[k].includes(this.productos[i].categoria)){
            this.cantidadPorCategoria[k] = this.cantidadPorCategoria[k] + this.cantProductosAgregados[i];
          }
        }
      }
    }
  }

  AbrirPedidos(){
    this.isModalOpen = false;
  }
  
  CalcularPrecio(){
    var precio = 0;

    for(var i = 0 ; i < this.cantProductosAgregados.length; i++){
      if(this.cantProductosAgregados[i] > 0){
        precio = precio + (this.cantProductosAgregados[i] * (Number(this.productos[i].precio)));
      }
    }
    this.precioTotal = precio;
  }

  CalcularTiempo(){
    var tiempoMayor = 0;

    for(var i = 0 ; i < this.cantProductosAgregados.length; i++){
      if(this.cantProductosAgregados[i] > 0){
        if((Number(this.productos[i].tiempoElaboracion)) > tiempoMayor){
          tiempoMayor = (Number(this.productos[i].tiempoElaboracion));
        }
      }
    }
    this.tiempoTotal = tiempoMayor;
  }

  TraerProductos() {
    this.subProductos = this.authService.getProducts().subscribe(allProducts => {
      this.productos = allProducts;
      this.productos.forEach(u => {
          
          var foto1Buscar = "productos/" + u.foto1;
          var foto2Buscar = "productos/" + u.foto2;
          var foto3Buscar = "productos/" + u.foto3;
          const storage = getStorage();

          const storageRef1 = ref(storage, foto1Buscar);
          getDownloadURL(storageRef1).then((response) => {
            u.foto1 = response;
          });

          const storageRef2 = ref(storage, foto2Buscar);
          getDownloadURL(storageRef2).then((response) => {
            u.foto2 = response;
          });

          const storageRef3 = ref(storage, foto3Buscar);
          getDownloadURL(storageRef3).then((response) => {
            u.foto3 = response;
          });
      });

      for(var i = 0 ; i < this.productos.length - 1; i++){
        for(var k = i + 1; k < this.productos.length ; k++){
          if((this.productos[i].producto).localeCompare(this.productos[k].producto) == 1){
            var prodAux = this.productos[i];
            this.productos[i] = this.productos[k];
            this.productos[k] = prodAux;
          }
        }
      }
    });
  }

  DesactivarSpinner(){
    setTimeout(() => {
      this.spinner = false;
      this.cargando = false;
    }, 10000);
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

  TraerPedidos(){
    this.subPedidos = this.authService.traerPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;
      var pedidosSeleccionados = [];
      for(var i = 0 ; i < this.pedidos.length - 1; i++){
        for(var k = i + 1; k < this.pedidos.length ; k++){
          if((Number(this.pedidos[i].idPedido)) > (Number(this.pedidos[k].idPedido))){
            var pedidoAux = this.pedidos[i];
            this.pedidos[i] = this.pedidos[k];
            this.pedidos[k] = pedidoAux;
          }
        }
      }

      for(var i = 0 ; i < this.estadoPedido.length; i++){
        this.cantTipoPedido[i] = 0;
      }

      this.pedidos.forEach(pedido => {
        pedido.hora = ((pedido.hora).substring(0,((pedido.hora).length - 3)));
        if(pedido.idUsuario.includes(this.usuarioActual.idUsuario) == true){
          pedidosSeleccionados.push(pedido);
          this.hayPedido = true;
        }
        for(var i = 0 ; i < this.estadoPedido.length; i++){
          if(this.estadoPedido[i].includes(pedido.estado)){
            this.cantTipoPedido[i] = 1;
          }
        }
      });
      this.pedidosVisibles = pedidosSeleccionados;
      if(this.pedirCuenta == 1){
        this.CalcularPago();
      }
      this.spinner = false;
      this.cargando = false;
    });
  }

  CalcularPago(){
    this.precioPagar = 0;
    this.pedidosVisibles.forEach(pedido => {
      var productosPedidos = JSON.parse(pedido.productos);
      for(var i = 0 ; i < productosPedidos.length; i++){
        for(var k = 0 ; k < this.productos.length ; k++){
          if((Number(this.productos[k].idProducto)) == (Number(productosPedidos[i].idProducto))){
            if(pedido.estado.includes("Recibido")){
              this.precioPagar = this.precioPagar + (Number(productosPedidos[i].cantidad)) * (Number(this.productos[k].precio));
            }
          }
        }
      }
    });
  }
  
  PedirCuenta(){
    this.pedidosPendientes = false;

    this.pedidos.forEach(pedido => {
      if(pedido.idUsuario === this.usuarioActual.idUsuario){

        if(!pedido.estado.includes("Recibido") && !pedido.estado.includes("Rechazado")){
          this.pedidosPendientes = true;
        }
      }
    });
    if(!this.pedidosPendientes){
      this.solicitarCuenta = true;
    }else{
      this.poseePedidosPendientes = true;
    }
  }

  Entendido(){
    this.poseePedidosPendientes = false;
  }
  CancelarEscanear(){
    this.solicitarCuenta = false;
  }

  
  async startScanner(){
    this.solicitarCuenta = false;
    this.scanActive = true;
    const result = await BarcodeScanner.startScan();
    if(result.hasContent){
      this.scanActive = false;
      this.result = result.content;
      this.AnalizarResultado();
    }
  }

  CodigoNoValido(){
    this.codigoInvalido = false;
    this.solicitarCuenta = true;
  }

  AnalizarResultado(){
    if(this.result === "PROPINA"){
      this.aceptarRadioButton = false;
      this.codigoEscaneado = true;
    }else{
      this.codigoInvalido = true;
    }
  }

  ConfirmarPedido(){
    this.confirmarPedido = true;
  }

  ValidarAceptar(){
    this.aceptarRadioButton = true;
  }

  AceptarSolicitud(){
    for(var i = 0 ; i < this.valores.length ; i++){
      if(this.valores[i].includes(this.opinion.value)){
        this.propina = ((this.porcentaje[i] * this.precioPagar) / 100);
        this.precioFinal = this.propina + this.precioPagar;
      }
    }

   this.propinaSolicitada = true;
   this.codigoEscaneado = false;
  }

  CierreCuenta(){
    this.confirmarSolicitud = true;
  }

  AceptarSolicitarCuenta(){
    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
    this.confirmarSolicitud = false;
    var flag = true;
    var listaMesas = "";

    this.mesas.forEach(mesa => {
      if(mesa.idUsuario === this.usuarioActual.idUsuario){
        if(flag){
          listaMesas = mesa.numMesa;
          flag = false;
        }else{
          listaMesas = listaMesas + "," + mesa.numMesa;
        }
      }
    });

    var unaCuenta: Cuenta = {
      idField: "",
      idUsuario: this.usuarioActual.idUsuario,
      total: this.precioPagar.toString(),
      propina: this.propina.toString(),
      mesas: listaMesas
    }
    this.authService.agregarCuenta(unaCuenta);

    this.solicitudEnviada = true;
    setTimeout(() => {
      this.router.navigateByUrl('/home-cliente-mesa', { replaceUrl: true });
    }, 3000);
  }

  CancelarSolicitarCuenta(){
    this.confirmarSolicitud = false;
  }

  CancelarSolicitud(){
    this.codigoEscaneado = false;
  }
  
  AceptarConfirmarPedido(){
    this.authService.pedidoRecibido(this.idFieldPedidoActual);
    this.confirmarPedido = false;
    this.isModalOpen = false;
    this.Alerta("Pedido Recibido", 'success');
    if(this.volumenOn){
      this.utilidades.SonidoConfirmar();
    }
  }

  CancelarConfirmarPedido(){
    this.confirmarPedido = false;
  }

  async Alerta(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'bottom',
      duration: 2500,
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  Volver(){
    this.spinner = true;
    this.router.navigateByUrl('/home-cliente-mesa', { replaceUrl: true });
  }
}
