import { AuthService, Producto, Pedido, Usuario, Mesa } from '../services/auth.service';
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { PushNotificationService } from '../services/push-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-listado-productos',
  templateUrl: './listado-productos.page.html',
  styleUrls: ['./listado-productos.page.scss'],
})
export class ListadoProductosPage implements OnInit, AfterViewInit, OnDestroy {

  result = null;
  scanActive = false;
  volumenOn = true;
  mesas: Mesa[];
  pedidos: Pedido[];
  idRegistroPedido = 0;
  productos: Producto[];
  productosSeleccionados: Producto[];
  cargando = true;
  spinner = true;
  esBebida = true;
  confirmarPedido = false;
  precioTotal = 0;
  tiempoTotal = 0;
  categoria = "";
  isModalOpen = false;
  isModalOpen2 = false;
  isModalOpen3 = false;
  buttonsArray = [true, true, true, true, true, true, true];
  categorias: string[] = [
    "Entradas",
    "Promociones",
    "Platos fríos",
    "Platos calientes",
    "Bebidas sin alcohol",
    "Bebidas con alcohol",
    "Postres y Café-Te"];
  cantidadPorCategoria = [0, 0, 0, 0, 0, 0, 0];
  productosAgregados = [];
  pedidoValido = false;
  numMesa = "";
  pedidoEnviado = false;
  idUsuarioMesa = "0";
  back = 0;
  categoriaUnProducto = "";
  unSoloProducto: Producto;
  users: Usuario[];

  subUsers: Subscription;
  subMesas: Subscription;
  subProductos: Subscription;
  subPedidos: Subscription;

  constructor(
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router,
    private utilidades: UtilidadesService,
    private pnService: PushNotificationService
  ) {
    for (var i = 0; i < 50; i++) {
      this.productosAgregados.push({ tiempo: 0, cantidad: 0, precio: 0, categoria: "" });
    }
    this.numMesa = localStorage.getItem('numeroMesa');
    this.back = (Number(localStorage.getItem('back')));
    this.Sonido();
    this.DesactivarSpinner();
    this.TraerProductos();
    this.TraerPedidos();
    this.TraerMesas();
    this.TraerUsuarios();
  }

  Sonido() {
    try {
      var sonido = localStorage.getItem('sonido');
      if (sonido != null) {
        if (sonido.includes("No")) {
          this.volumenOn = false;
        }
      }
    } catch (error) {

    }
  }

  TraerUsuarios() {
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
      this.users = allUsers;
    });
  }

  ngAfterViewInit() {
    BarcodeScanner.prepare();
  }

  ngOnDestroy() {
    this.stopScan();
    this.subUsers.unsubscribe();
    this.subMesas.unsubscribe();
    this.subProductos.unsubscribe();
    this.subPedidos.unsubscribe();
  }

  async startScanner() {
    this.scanActive = true;
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      this.scanActive = false;
      this.result = result.content;
      this.AnalizarResultado();
    }
  }

  AnalizarResultado() {
    var flag = false;

    this.productos.forEach(producto => {
      if (producto.qr === this.result) {
        flag = true;
        this.categoriaUnProducto = producto.categoria;
        this.unSoloProducto = producto;
      }
    });

    if (flag) {
      this.isModalOpen3 = true;
    } else {
      this.Alerta("Código no válido", 'danger');
      if (this.volumenOn) {
        this.utilidades.SonidoError();
      }
      this.utilidades.VibrarError();
    }
  }

  stopScan() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  ngOnInit() {

  }

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
      this.mesas.forEach(m => {
        if (m.numMesa === this.numMesa) {
          this.idUsuarioMesa = m.idUsuario;
        }
      });
    });
  }

  TraerPedidos() {
    this.subPedidos = this.authService.traerPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;

      var mayorId = 0;

      if (this.pedidos.length == 0) {
        this.idRegistroPedido = 1;
      } else {
        for (var i = 0; i < this.pedidos.length; i++) {
          if ((Number(this.pedidos[i].idPedido)) > mayorId) {
            mayorId = (Number(this.pedidos[i].idPedido));
          }
        }
        mayorId = mayorId + 1;
        this.idRegistroPedido = mayorId;
      }
    });
  }

  VerMenu() {
    this.isModalOpen = false;
    this.isModalOpen2 = false;
    this.isModalOpen3 = false;
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

      for (var i = 0; i < this.productos.length - 1; i++) {
        for (var k = i + 1; k < this.productos.length; k++) {
          if ((this.productos[i].producto).localeCompare(this.productos[k].producto) == 1) {
            var userA = this.productos[i];
            this.productos[i] = this.productos[k];
            this.productos[k] = userA;
          }
        }
      }

      for (var i = 0; i < this.productos.length; i++) {
        this.productosAgregados[Number(this.productos[i].idProducto)].tiempo = Number(this.productos[i].tiempoElaboracion);
        this.productosAgregados[Number(this.productos[i].idProducto)].precio = Number(this.productos[i].precio);
        this.productosAgregados[Number(this.productos[i].idProducto)].categoria = this.productos[i].categoria;
        for (var k = 0; k < this.categorias.length; k++) {
          if (this.productos[i].categoria.includes(this.categorias[k])) {
            this.buttonsArray[k] = false;
            k = this.categorias.length;
          }
        }
      }
    });
  }

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
      this.cargando = false;
    }, 6000);
  }

  FiltrarCategoria(categoria) {
    this.isModalOpen = true;
    this.categoria = categoria;
    this.categoria == 'Bebidas sin alcohol' || this.categoria == 'Bebidas con alcohol' ? this.esBebida = true : this.esBebida = false;
  }

  SumarProducto(idProducto: string) {
    this.productosAgregados[Number(idProducto)].cantidad = this.productosAgregados[Number(idProducto)].cantidad + 1;
    this.CalcularPrecio();
    this.CalcularTiempo();
    this.CantidadPorCategoria();
  }

  RestarProducto(idProducto: string) {
    if (this.productosAgregados[Number(idProducto)].cantidad > 0) {
      this.productosAgregados[Number(idProducto)].cantidad = this.productosAgregados[Number(idProducto)].cantidad - 1;
    }
    this.CalcularPrecio();
    this.CalcularTiempo();
    this.CantidadPorCategoria();
  }

  CalcularPrecio() {
    var precio = 0;
    this.pedidoValido = false;
    this.productosAgregados.forEach(element => {
      if (element.cantidad > 0) {
        this.pedidoValido = true;
        precio = precio + (element.precio * element.cantidad);
      }
    });
    this.precioTotal = precio;
  }

  CalcularTiempo() {
    var tiempoMayor = 0;
    this.productosAgregados.forEach(element => {
      if (element.cantidad > 0 && element.tiempo > tiempoMayor) {
        tiempoMayor = element.tiempo;
      }
    });
    this.tiempoTotal = tiempoMayor;
  }

  CantidadPorCategoria() {
    for (var i = 0; i < this.categorias.length; i++) {
      this.cantidadPorCategoria[i] = 0;
    }
    this.productosAgregados.forEach(element => {
      if (element.cantidad > 0) {
        for (var i = 0; i < this.categorias.length; i++) {
          if (this.categorias[i].includes(element.categoria)) {
            this.cantidadPorCategoria[i] = this.cantidadPorCategoria[i] + element.cantidad;
          }
        }
      }
    });
  }

  RealizarPedido() {
    this.isModalOpen2 = true;
  }

  Caracteres(dato: string) {
    var retorno = dato.toString();
    if (dato.length == 1) {
      retorno = "0" + retorno;
    }
    return retorno;
  }

  Confirmar() {
    this.spinner = true;

    if (this.idRegistroPedido != 0) {

      var tokens = [""];
      var flagOnce = true;

      this.isModalOpen2 = false;
      this.DesactivarSpinner();

      var date = new Date();
      var fechaActual = this.Caracteres(date.getDate().toString()) + "/" + this.Caracteres(date.getMonth().toString()) + "/" + date.getFullYear().toString();
      var horaActual = this.Caracteres(date.getHours().toString()) + ":" + this.Caracteres(date.getMinutes().toString()) + ":" + this.Caracteres(date.getSeconds().toString());
      var flag = true;

      var productosPedido = "[";

      var lCocinero = "-1";
      var lBartender = "-1";

      for (var i = 0; i < this.productos.length; i++) {
        var index = Number(this.productos[i].idProducto);
        if (this.productosAgregados[index].cantidad > 0) {

          for (var k = 0; k < this.categorias.length; k++) {
            if ((this.categorias[k]).includes(this.productos[i].categoria)) {
              if (k < 4) {
                lCocinero = "0";
              } else {
                lBartender = "0";
              }
            }
          }

          if (flag) {
            flag = false;
            productosPedido = productosPedido + '{"idProducto":"' + index.toString() + '", "cantidad":"' + (this.productosAgregados[index].cantidad).toString() + '"}';
          } else {
            productosPedido = productosPedido + ',{"idProducto":"' + index.toString() + '", "cantidad":"' + (this.productosAgregados[index].cantidad).toString() + '"}';
          }
        }
      }

      this.users.forEach(user => {

        if (user.token != "") {
          if (this.back == 0) {
            var entrar = false;
            if (user.tipo.includes("Cocinero") && lCocinero == "0") {
              entrar = true;
            }
            if (user.tipo.includes("Bartender") && lBartender == "0") {
              entrar = true;
            }
            if (entrar) {
              if (flagOnce) {
                flagOnce = false;
                tokens[0] = user.token;
              } else {
                tokens.push(user.token);
              }
            }
          }

          if (this.back == 1) {
            if (user.tipo.includes("Mozo")) {
              if (user.token != "") {
                if (flagOnce) {
                  flagOnce = false;
                  tokens[0] = user.token;
                } else {
                  tokens.push(user.token);
                }
              }
            }
          }
        }
      });

      productosPedido = productosPedido + "]";

      var estadoPedido = "";
      if (this.back == 0) {
        var estadoPedido = "Confirmado";
      }
      if (this.back == 1) {
        var estadoPedido = "Enviado";
        lCocinero = "-2";
        lBartender = "-2";
      }

      var unPedido: Pedido = {
        idField: "",
        idPedido: (this.idRegistroPedido.toString()),
        numMesa: this.numMesa,
        productos: productosPedido,
        fecha: fechaActual,
        hora: horaActual,
        estado: estadoPedido,
        listoCocinero: lCocinero,
        listoBartender: lBartender,
        idUsuario: this.idUsuarioMesa
      };

      this.authService.agregarPedido(unPedido);
      this.spinner = false;
      this.pedidoEnviado = true;
      if (this.volumenOn) {
        this.utilidades.SonidoConfirmar();
      }

      setTimeout(() => {
        if (!flagOnce) {
          this.pnService.sendPush(tokens, "Ingreso un Pedido", "Pedido Pendiente", { operacion: 'PedidoPendiente' });
        }
      }, 1500);

      setTimeout(() => {
        this.Redirigir();
      }, 3000);
    } else {
      //CHECKEAR QUE SE VEA EL AVISO POR MODAL
      this.Alerta("Código no válido", 'danger');
      if (this.volumenOn) {
        this.utilidades.SonidoError();
      }
      this.utilidades.VibrarError();
      this.spinner = false;
      this.TraerPedidos();
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
    await toast.present();
  }

  Volver() {
    this.spinner = true;
    this.Redirigir();
  }

  Redirigir() {
    if (this.back == 0) {
      this.router.navigateByUrl('/home-mozo', { replaceUrl: true });
    }
    if (this.back == 1) {
      this.router.navigateByUrl('/home-cliente-mesa', { replaceUrl: true });
    }
  }
}
