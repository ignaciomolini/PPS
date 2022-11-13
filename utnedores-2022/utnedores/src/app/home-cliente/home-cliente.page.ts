import { UtilidadesService } from '../services/utilidades.service';
import { AuthService, Mesa, Usuario, Espera } from '../services/auth.service';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { PushNotificationService } from '../services/push-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
})
export class HomeClientePage implements OnInit, AfterViewInit, OnDestroy {

  variableUnicaVez = true;
  result = null;
  scanActive = false;
  users: Usuario[];
  mesas: Mesa[];
  listaEspera: Espera[];

  clienteAnonimo = true;
  volumenOn = true;
  esRegistrado = false;
  spinner = true;
  qrLocal = "LOCALUTNEDORES";
  usuarioLogueado: Usuario = {
    idField: "0",
    idUsuario: "0",
    nombre: "0",
    apellido: "0",
    correo: "0",
    clave: "0",
    dni: "0",
    cuil: "0",
    foto: "0",
    perfil: "0",
    tipo: "0",
    aprobado: "0",
    token: ""
  };
  mensajeEstado = "";
  estado = 0;

  preferenciaMesa = "";

  mesaAsignada = false;
  idFieldEspera = "";
  cantidadPersonas = 0;
  ingresarCantidad = false;
  subUsers: Subscription;
  subListaEspera: Subscription;
  subMesas: Subscription;

  idEsperaMayor = 0;
  //0   => Escanear QR Local
  //1   => En lista de espera
  //2   => Mesa asignada
  //3   => 

  constructor(
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private utilidades: UtilidadesService,
    private pnService: PushNotificationService
  ) {
    this.Sonido();
    this.DesactivarSpinner();
    this.TraerMesas();
    this.TraerEsperas();
    this.TraerUsuarios();
    this.ObtenerUsuario();
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

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
    }, 8000);
  }
  
  ngOnInit() { }

  IrEncuestas() {
    this.spinner = true;
    this.router.navigateByUrl('/resultados-encuestas-cliente', { replaceUrl: true });
  }

  IrReservar() {
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

  stopScan() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  Caracteres(dato: string) {
    var retorno = dato.toString();
    if (dato.length == 1) {
      retorno = "0" + retorno;
    }
    return retorno;
  }

  TraerUsuarios() {
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
      this.users = allUsers;
    });
  }

  ActivarSpinner() {
    this.spinner = true;
  }

  ActivarDesactivarSonido() {
    if (this.volumenOn) {
      this.volumenOn = false;
      localStorage.setItem('sonido', "No");
    } else {
      this.volumenOn = true;
      localStorage.setItem('sonido', "Si");
    }
  }

  SonidoEgreso() {
    if (this.volumenOn) {
      this.utilidades.PlayLogout();
    }
    localStorage.clear();
  }

  CerrarSesion() {
    this.spinner = true;
    this.subUsers.unsubscribe();

    setTimeout(() => {
      this.authService.logout();
    }, 1000);


    if (!this.esRegistrado) {
      //CHECKEAR QUE NO TENGA MESA
      //NO
      //ELIMINAR REGISTRO Y DE LA LISTA
      //SI
      //TIENE UNA MESA ASIGNADA
    }

    this.SonidoEgreso();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  ngAfterViewInit() {
    BarcodeScanner.prepare();
  }

  ngOnDestroy() {
    this.stopScan();
    this.subMesas.unsubscribe();
    this.subListaEspera.unsubscribe();
  }

  ObtenerUsuario() {
    setTimeout(() => {
      this.authService.getUser(this.authService.usuarioActual()).then(user => {
        this.usuarioLogueado = (user as Usuario);
        if (this.usuarioLogueado.tipo.includes("Registrado")) {
          this.esRegistrado = true;
        }
      });
    }, 2500);
  }

  TraerMesas() {
    this.subMesas = this.authService.getTables().subscribe(allTables => {
      this.mesas = allTables;
      for (var i = 0; i < this.mesas.length - 1; i++) {
        for (var k = i + 1; k < this.mesas.length; k++) {
          if ((Number(this.mesas[i].numMesa)) > (Number(this.mesas[k].numMesa))) {
            var mesaAux: Mesa = this.mesas[i];
            this.mesas[i] = this.mesas[k];
            this.mesas[k] = mesaAux;
          }
        }
      }
      //ENTRA CAMBIO MESA
      setTimeout(() => {
        this.VerEstado(false);
      }, 3500);
    });
  }

  TraerEsperas() {
    this.subListaEspera = this.authService.listaEspera().subscribe(esperas => {
      this.listaEspera = esperas;
      this.listaEspera.forEach(u => {
        if (this.idEsperaMayor < (Number(u.idEspera))) {
          this.idEsperaMayor = (Number(u.idEspera));
        }
      });
      this.idEsperaMayor = this.idEsperaMayor + 1;
      setTimeout(() => {
        this.VerEstado(false);
      }, 3500);
      //ENTRA CAMBIO LISTAESPERA
    });
  }

  async startScanner() {

    var verificar = true;
    if (this.mesas.length == 0 || this.mesas == null) {
      this.TraerMesas();
      verificar = false;
    }

    if (this.idEsperaMayor == 0 || this.listaEspera == null) {
      this.TraerEsperas();
      verificar = false;
    }
    if (this.usuarioLogueado.idUsuario === "0") {
      this.ObtenerUsuario();
      verificar = false;
    }

    if (verificar) {
      this.scanActive = true;
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        this.scanActive = false;
        this.result = result.content;
        this.AnalizarResultado();
      }
    } else {
      this.Alerta("Ocurrió un error! Reintentar", 'danger');
    }
  }

  ModificarEstado(mensaje: string) {
    this.mensajeEstado = mensaje;
  }

  AbrirOpcionesMesa() {
    this.cantidadPersonas = 0;
    this.ingresarCantidad = true;
  }

  ModificarOpcionesMesa(cantPersonas: number) {
    this.cantidadPersonas = cantPersonas;
    this.ingresarCantidad = true;
  }

  Sumar() {
    if (this.cantidadPersonas < 8) {
      this.cantidadPersonas = this.cantidadPersonas + 1;
    }
  }

  Restar() {
    if (this.cantidadPersonas > 0) {
      this.cantidadPersonas = this.cantidadPersonas - 1;
    }
  }

  Aceptar() {
    if (this.estado == 0) {   //NO ESTABA EN LISTA DE ESPERA
      this.AgregarListaEspera();
    } else {
      this.ModificarListaEspera();
    }
  }

  Cancelar() {
    this.ingresarCantidad = false;
  }

  SetTipoMesa(valor) {
    this.preferenciaMesa = valor.detail.value;
  }

  AgregarListaEspera() {
    var flag = true;
    var tokens = [""];

    this.users.forEach(user => {
      if (user.tipo.includes("Metre")) {
        if (user.token != "") {
          if (flag) {
            flag = false;
            tokens[0] = user.token;
          } else {
            tokens.push(user.token);
          }
        }
      }
    });

    var date = new Date();
    var fechaActual = this.Caracteres(date.getDate().toString()) + "/" + this.Caracteres(date.getMonth().toString()) + "/" + date.getFullYear().toString();
    var horaActual = this.Caracteres(date.getHours().toString()) + ":" + this.Caracteres(date.getMinutes().toString()) + ":" + this.Caracteres(date.getSeconds().toString());
    var unaEspera: Espera = {
      idField: "",
      idEspera: (this.idEsperaMayor.toString()),
      idUsuario: this.usuarioLogueado.idUsuario,
      nombre: this.usuarioLogueado.nombre,
      apellido: this.usuarioLogueado.apellido,
      foto: this.usuarioLogueado.foto,
      fecha: fechaActual,
      hora: horaActual,
      cantPersonas: (this.cantidadPersonas).toString(),
      preferencia: this.preferenciaMesa
    }

    this.authService.agregarEspera(unaEspera).then((res) => {
      if (res) {
        this.Alerta("EN LISTA DE ESPERA", 'success');
        if(this.volumenOn){
          this.utilidades.SonidoConfirmar();
        }
        this.ModificarEstado("EN LISTA DE ESPERA");
        this.estado = 1;
      }
    });
    this.ingresarCantidad = false;
    setTimeout(() => {
      if (!flag) {
        this.pnService.sendPush(tokens, "Ingresó un Cliente", "En Lista de Espera", { operacion: 'ListaEspera' });
      }
    }, 1500);
  }

  ModificarListaEspera() {
    if (this.cantidadPersonas == 0) {
      this.authService.eliminarEspera(this.idFieldEspera);
      this.estado = 0;
      this.ModificarEstado("ESCANEAR QR LOCAL");
      this.ingresarCantidad = false;
    } else {
      this.authService.modificarEspera(this.idFieldEspera, (this.cantidadPersonas).toString());
      this.ModificarEstado("EN LISTA DE ESPERA");
      this.estado = 1;
      this.ingresarCantidad = false;
    }
  }

  DirigirMenu() {
    this.router.navigateByUrl('/home-cliente-mesa', { replaceUrl: true });
  }

  VerEstado(flag: boolean) {
    if(this.variableUnicaVez){
      this.variableUnicaVez = false;
      this.estado = 0;  //ESCANEAR QR LOCAL

      var cantPersonasEspera = 0;
      this.idFieldEspera = "";

      this.listaEspera.forEach(u => {
        if (u.idUsuario === this.usuarioLogueado.idUsuario) {
          this.estado = 1;//EN LISTA DE ESPERA
          this.ModificarEstado("EN LISTA DE ESPERA");

          cantPersonasEspera = Number(u.cantPersonas);
          this.idFieldEspera = u.idField;
        }
      });
      if (this.estado == 1 && flag == true) {
        this.ModificarOpcionesMesa(cantPersonasEspera);
      }

      if (this.estado == 0) {
        var mesasDisponibles = "";
        var cant = 0;
        this.mesas.forEach(u => {
          if (this.usuarioLogueado.idUsuario != "0" && u.idUsuario === this.usuarioLogueado.idUsuario) {
            this.estado = 2;//TIENE AL MENOS 1 MESA ASIGNADA

            cant = cant + 1;
            if (cant == 1) {
              mesasDisponibles = u.numMesa;
            } else {
              mesasDisponibles = mesasDisponibles + ", " + u.numMesa;
            }
          }
        });
        if (cant == 0) {
          this.ModificarEstado("ESCANEAR QR LOCAL");
        } else {
          if (cant == 1) {
            this.ModificarEstado(("MESA ASIGNADA: " + mesasDisponibles));
          } else {
            this.ModificarEstado(("MESAS ASIGNADAS: " + mesasDisponibles));
          }
        }
      }
      this.spinner = false;


    }
    this.variableUnicaVez = true;
  }

  AnalizarResultado() {
    var numeroMesa = "";
    if (this.result.includes(this.qrLocal)) {

      this.VerEstado(true);

      if (this.estado == 0) {
        this.AbrirOpcionesMesa();
      }
      if (this.estado == 2) {
        this.Alerta("Escanear QR Mesa", "warning");
      }

    } else {
      var estadoMesa = 0;
      //0 MESA NO ENCONTRADA
      //1 ENCONTRADA Y NO DISPONIBLE
      //2 ENCONTRADA Y ASIGNADA

      this.mesas.forEach(u => {
        if (this.result === u.qr) {
          estadoMesa = 1;
          if (this.usuarioLogueado.idUsuario == u.idUsuario) {
            estadoMesa = 2;
          }
        }
      });

      if (estadoMesa == 0) {
        this.Alerta("CÓDIGO INVÁLIDO", 'danger');
      } else {
        if (estadoMesa == 1) {
          this.Alerta("MESA NO ASIGNADA", 'danger');
        } else {
          if (estadoMesa == 2) {

            var once = true;

            this.mesas.forEach(u => {
                if (this.usuarioLogueado.idUsuario == u.idUsuario) {
                  if(once){
                    once = false;
                    numeroMesa = u.numMesa;
                  }
                }
            });

            localStorage.setItem('numeroMesa', numeroMesa);
            this.DirigirMenu();
          }
        }
      }
    }
  }
}
