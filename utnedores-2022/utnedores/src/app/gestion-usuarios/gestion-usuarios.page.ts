import { Component, OnInit, OnDestroy } from '@angular/core';
import { getStorage, ref } from "firebase/storage";
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { getDownloadURL } from '@angular/fire/storage';
import { ToastController } from '@ionic/angular';
import { UtilidadesService } from '../services/utilidades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
})
export class GestionUsuariosPage implements OnInit, OnDestroy {

  volumenOn = true;
  spinner = true;
  users: Usuario[];
  selectedUsers = [];
  pathFoto = "../../assets/user-photo.png";
  cargando = true;
  subUsers: Subscription;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private utilidades: UtilidadesService
  ) {
    this.spinner = true;
    this.Sonido();
    this.DesactivarSpinner();
    this.TraerUsuarios();
  }

  ngOnDestroy(){	
    this.subUsers.unsubscribe();
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


  DesactivarSpinner() {
    setTimeout(() => {
      this.spinner = false;
      this.cargando = false;
    }, 7000);
  }

  Historial(idUsuario: string){
    this.spinner = true;
    localStorage.setItem('idUsuarioEncuesta', idUsuario);
    this.router.navigateByUrl('/historial-usuario', { replaceUrl: true });
  }

  Formulario(idUsuario: string){
    this.spinner = true;
    localStorage.setItem('idUsuarioEncuesta', idUsuario);
    this.router.navigateByUrl('/encuesta-supervisor', { replaceUrl: true });
  }

  async TraerUsuarios() {
    this.subUsers = this.authService.getUsers().subscribe(allUsers => {
        var usuariosSeleccionados = [];
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

  ngOnInit() { 
    
  }

  Volver(){
    this.spinner = true;
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
