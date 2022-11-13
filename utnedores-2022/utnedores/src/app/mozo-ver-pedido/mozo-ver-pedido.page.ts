import { UtilidadesService } from '../services/utilidades.service';
import { AuthService, Pedido, Producto,Usuario } from '../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL } from '@angular/fire/storage';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PushNotificationService } from '../services/push-notification.service';

@Component({
  selector: 'app-mozo-ver-pedido',
  templateUrl: './mozo-ver-pedido.page.html',
  styleUrls: ['./mozo-ver-pedido.page.scss'],
})
export class MozoVerPedidoPage implements OnInit, OnDestroy {

  productos: Producto[];

  precioTotal = 0;
  tiempoTotal = 0;

  rechazarPedido = false;
  confirmarPedido = false;
  permitirModificar = false;
  permitirConfirmar = false;
  hacerCambios = true;
  permitirRechazarPedido = false;

  pedidoValido = true;
  hayPedido = false;
  pedidos: Pedido[];
  volumenOn = true;
  spinner = true;
  cargando = true;
  isModalOpen = false;
  isModalOpen2 = false;
  isModalOpen3 = false;
  pedidoConfirmado = false;
  pedidoNum = "0";
  idFieldPedidoActual = "";
  numeroMesa = "0";
  pedido: any;
  pedidoAux: any;
  categoria = "";
  esBebida = true;
  buttonsArray = [];
  cantProductosAgregados = [];
  cantidadPorCategoria = [];
  categorias: string[] = [
    "Entradas",
    "Promociones",
    "Platos fríos",
    "Platos calientes",
    "Bebidas sin alcohol",
    "Bebidas con alcohol",
    "Postres y Café-Te"];
  estadoPedido: string[] = [
    "Pendientes",
    "Confirmados",
    "Preparados",
    "Entregados",
    "Rechazados"];
  tipoPedido: string[] = [
    "Enviado",
    "Confirmado",
    "Preparado",
    "Recibido",
    "Rechazado"];
  cantTipoPedido = [];
  subProductos: Subscription;
  subPedidos: Subscription;
  subUsers: Subscription;
  users: Usuario[];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService,
    private utilidades: UtilidadesService,
    private pnService: PushNotificationService
  ) { 
    for(var i = 0 ; i < 50; i++){
      this.cantProductosAgregados.push(0);
      if(i < 7){
        this.cantidadPorCategoria.push(0);
        this.buttonsArray.push(true);
      }
      if(i < 5){
        this.cantTipoPedido.push(0);
      }
    }
    this.DesactivarSpinner();
    this.Sonido();
    this.TraerPedidos();
    this.TraerProductos();
    this.TraerUsuarios();

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
    this.subProductos.unsubscribe();
    this.subPedidos.unsubscribe();

  }

  TraerUsuarios() {
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
      this.users = allUsers;
    });
  }

  FiltrarCategoria(categoria) {
    this.isModalOpen3 = true;
    this.isModalOpen2 = false;
    this.categoria = categoria;
    this.categoria == 'Bebidas sin alcohol' || this.categoria == 'Bebidas con alcohol'? this.esBebida = true : this.esBebida = false;
  }

  AbrirPedidos(){
    this.isModalOpen = false;
  }

  VerPedido(index: number, numMesa: string, idField: string){
    this.hacerCambios = true;
    this.permitirRechazarPedido = true
    this.permitirModificar = false;
    this.permitirConfirmar = false;

    this.idFieldPedidoActual = idField;
    this.pedidoNum = (index + 1).toString();
    this.numeroMesa = numMesa;

    for(var i = 0 ; i < 50; i++){
      this.cantProductosAgregados[i] = 0;
    }

    if(this.pedidos[index].estado.includes("Enviado")){
      this.permitirModificar = true;
      this.permitirConfirmar = true;
    }else{
      this.hacerCambios = false;
    }

    if(this.pedidos[index].estado.includes("Rechazado")){
      this.permitirRechazarPedido = false;
    }

    var pedidoAux = JSON.parse(this.pedidos[index].productos);

    for(var i = 0 ; i < pedidoAux.length; i++){
      
      for(var k = 0 ; k < this.productos.length ; k++){
        if((Number(this.productos[k].idProducto)) == (Number(pedidoAux[i].idProducto))){
          this.cantProductosAgregados[k] = (Number(pedidoAux[i].cantidad));
          k = this.productos.length;
        }
      }
    }
    this.CantidadPorCategoria();
    this.CalcularPrecio();
    this.CalcularTiempo();
    this.isModalOpen = true;
  }

  CalcularPrecio(){
    var precio = 0;
    this.pedidoValido = false;

    for(var i = 0 ; i < this.cantProductosAgregados.length; i++){
      if(this.cantProductosAgregados[i] > 0){
        this.pedidoValido = true;
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
  
  SumarProducto(idProducto: string){
    for(var i = 0 ; i < this.productos.length ; i++){
      if((Number(this.productos[i].idProducto)) == (Number(idProducto))){
        this.cantProductosAgregados[i] = this.cantProductosAgregados[i] + 1;
        i = this.productos.length;
      }
    }
    this.CantidadPorCategoria();
    this.CalcularPrecio();
    this.CalcularTiempo();
  }

  RestarProducto(idProducto: string){
    for(var i = 0 ; i < this.productos.length ; i++){
      if((Number(this.productos[i].idProducto)) == (Number(idProducto))){
        if(this.cantProductosAgregados[i] > 0){
          this.cantProductosAgregados[i] = this.cantProductosAgregados[i] - 1;
        }
        i = this.productos.length;
      }
    }
    this.CantidadPorCategoria();
    this.CalcularPrecio();
    this.CalcularTiempo();
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

  ngOnInit() {
  }

  DesactivarSpinner(){
    setTimeout(() => {
      this.spinner = false;
    }, 7000);
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

      for(var i = 0 ; i < this.productos.length; i++){
        for(var k = 0; k < this.categorias.length ; k++){
          if(this.productos[i].categoria.includes(this.categorias[k])){
            this.buttonsArray[k] = false;
            k = this.categorias.length;
          }
        }
      }
      setTimeout(() => {
        this.cargando = false;
        this.spinner = false;
      }, 1500);
    });
  }

  TraerPedidos(){
    this.subPedidos = this.authService.traerPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;

      for(var i = 0 ; i < this.pedidos.length - 1; i++){
        for(var k = i + 1; k < this.pedidos.length ; k++){
          if((Number(this.pedidos[i].idPedido)) > (Number(this.pedidos[k].idPedido))){
            var pedidoAux = this.pedidos[i];
            this.pedidos[i] = this.pedidos[k];
            this.pedidos[k] = pedidoAux;
          }
        }
      }
      for(var u = 0 ; u < this.tipoPedido.length ; u++){
        this.cantTipoPedido[u] = 0;
      }
      for(var i = 0 ; i < this.pedidos.length; i++){
        this.pedidos[i].hora = ((this.pedidos[i].hora).substring(0,((this.pedidos[i].hora).length - 3)));
        for(var u = 0 ; u < this.tipoPedido.length ; u++){
          if(this.tipoPedido[u].includes(this.pedidos[i].estado)){
            this.cantTipoPedido[u] = 1;
          }
        }
      }
      if(this.pedidos.length > 0){
        this.hayPedido = true;
      }
    });
  }

  Volver(){
    this.spinner = true;
    this.router.navigateByUrl('/home-mozo', { replaceUrl: true });
  }

  RechazarPedido(){
    this.rechazarPedido = true;
  }

  AceptarRechazarPedido(){
    this.spinner = true;
    this.DesactivarSpinner();
    this.isModalOpen = false;
    this.authService.rechazarPedido(this.idFieldPedidoActual);
    setTimeout(() => {
      this.spinner = false;
      this.Alerta("Pedido Rechazado", 'warning');
      if(this.volumenOn){
        this.utilidades.SonidoRechazar();
      }
      this.utilidades.VibrarRechazar();
    }, 3000);
  }

  CancelarRechazarPedido(){
    this.rechazarPedido = false;
  }

  ConfirmarPedido(){
    this.confirmarPedido = true;
  }

  AceptarConfirmarPedido(){
    this.spinner = true;
    this.DesactivarSpinner();
    this.isModalOpen = false;

    var flag = true;
    var productosPedido = "[";
  
    for(var i = 0 ; i < this.productos.length; i++){
      if(this.cantProductosAgregados[i] > 0){

        if(flag){
          flag = false;
          productosPedido = productosPedido + '{"idProducto":"' + (this.productos[i].idProducto.toString()) + '", "cantidad":"' + (this.cantProductosAgregados[i].toString()) + '"}';
        }else{
          productosPedido = productosPedido + ',{"idProducto":"' + (this.productos[i].idProducto.toString()) + '", "cantidad":"' + (this.cantProductosAgregados[i].toString()) + '"}';
        }
      }
    }

    productosPedido = productosPedido + "]";

    var lCocinero = "-1";
    var lBartender = "-1";

    for(var i = 0 ; i < this.cantidadPorCategoria.length ; i++){
      if(i < 4){
        if(this.cantidadPorCategoria[i] > 0){
          lCocinero = "0";
        }
      }else{
        if(this.cantidadPorCategoria[i] > 0){
          lBartender = "0";
        }
      }
    }

    this.authService.confirmarPedido(this.idFieldPedidoActual, productosPedido, lCocinero, lBartender);
    
    
    var tokens = [""];
    var flagOnce = true;


    this.users.forEach(user => {
      if (user.tipo.includes("Cocinero") && user.token != "" && lCocinero == "0") {
        if (flagOnce) {
          flagOnce = false;
          tokens[0] = user.token;
        } else {
          tokens.push(user.token);
        }
      }
      if (user.tipo.includes("Bartender") && user.token != "" && lBartender == "0") {
        if (flagOnce) {
          flagOnce = false;
          tokens[0] = user.token;
        } else {
          tokens.push(user.token);
        }
      }
    });

    setTimeout(() => {
      if (!flagOnce) {
        this.pnService.sendPush(tokens, "Ingreso un Pedido", "Pedido Pendiente", { operacion: 'PedidoPendiente' });
      }
    }, 1500);
    
    setTimeout(() => {
      this.spinner = false;
      this.confirmarPedido = false;
      this.Alerta("Pedido Confirmado", 'success');
      if(this.volumenOn){
        this.utilidades.SonidoConfirmar();
      }
    }, 3000);
  }

  CancelarConfirmarPedido(){
    this.confirmarPedido = false;
  }

  ModificarPedido(){
    this.isModalOpen2 = true;
    this.isModalOpen = false;
  }

  ModificarListo(){
    this.isModalOpen = true;
    this.isModalOpen2 = false;
  }

  VerMenu(){
    this.isModalOpen2 = true;
    this.isModalOpen3 = false;
  }
}
