import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService, EncuestaSupervisor, Usuario } from '../services/auth.service';
import { UtilidadesService } from '../services/utilidades.service';
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL } from '@angular/fire/storage';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-historial-usuario',
  templateUrl: './historial-usuario.page.html',
  styleUrls: ['./historial-usuario.page.scss'],
})
export class HistorialUsuarioPage implements OnInit, OnDestroy {

  idUsuarioEncuesta = "0";
  iconoEncuesta = "../../assets/form.png";
  encuestas: EncuestaSupervisor[];
  users: Usuario[];
  selectedUsers = [];
  spinner: boolean = true;
  cargando = true;
  cargandoNombre = true;
  nombreUsuario = "";
  apellidoUsuario = "";
  subUsers: Subscription;
  subEncuestas: Subscription;

  constructor(
    private toastController : ToastController,
    private authService: AuthService,
    private router: Router,
    private utilidades: UtilidadesService
  ) {
    this.idUsuarioEncuesta = localStorage.getItem('idUsuarioEncuesta');
    this.spinner = true;
    this.cargando = true;

    setTimeout(() => {
      this.TraerEncuestasSupervisor();
      this.TraerUsuarios();
    }, 2000);

    setTimeout(() => {
      this.ObtenerDatosUsuario();
      this.cargandoNombre = false;
    }, 3000);

    setTimeout(() => {
      this.spinner = false;
      this.cargando = false;
    }, 5000);
  }

  ngOnDestroy(){	
    this.subUsers.unsubscribe();
    this.subEncuestas.unsubscribe();
  }

  ngOnInit() {
  }

  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
      this.cargando = false;
    }, 4000);
  }

  TraerEncuestasSupervisor() {
    this.subEncuestas = this.authService.traerEncuestaSupervisor().subscribe(listaencuestas => {
      this.encuestas = listaencuestas;
    });
  }


  async TraerUsuarios() {
    var usuariosSeleccionados = [];
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
        this.users = allUsers;
        this.users.forEach(user => {
          if(!user.aprobado.includes("No")) {
            if(!user.perfil.includes("Supervisor")){
              if(!user.perfil.includes("Dueño")){
                if(!user.tipo.includes("Anónimo")){
                  usuariosSeleccionados.push(user);
                }
              }
            }
          }
        });
        this.selectedUsers = usuariosSeleccionados;
        for(var i = 0 ; i < this.selectedUsers.length - 1; i++){
          for(var k = i + 1 ; k < this.selectedUsers.length; k++){
            if(((this.selectedUsers[i].nombre).localeCompare(this.selectedUsers[k].nombre)) == 1){
              var userAux = this.selectedUsers[i];
              this.selectedUsers[i] = this.selectedUsers[k];
              this.selectedUsers[k] = userAux;
            }
          }
        }
        this.selectedUsers.forEach(u => {
          var fotoBuscar = "usuarios/" + u.foto;
          const storage = getStorage();
          const storageRef = ref(storage, fotoBuscar);
          getDownloadURL(storageRef).then((response) => {
            u.foto = response;
          });
        });
        this.cargando = false;
        this.spinner = false;
    });
  }

  ObtenerDatosUsuario() {
    this.users.forEach(u => {
      if(this.idUsuarioEncuesta == u.idUsuario) {
        this.nombreUsuario = u.nombre;
        this.apellidoUsuario = u.apellido;
      }
    });
  }

  Volver() {
    this.spinner = true;
    this.router.navigateByUrl('/gestion-usuarios', { replaceUrl: true });
  }


}
