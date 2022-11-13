import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { DbService } from '../services/db.service';
import { ToastController } from '@ionic/angular';
import { DeviceMotion, DeviceMotionAccelerationData } from '@awesome-cordova-plugins/device-motion/ngx';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  estado: boolean = true;
  usuarioActual: any = {};
  deviceMotionSub: Subscription;
  posicion: string = 'horizontal';

  constructor(private authService: AuthService, private router: Router, private dbService: DbService,
    private toastController: ToastController, private deviceMotion: DeviceMotion, private flashlight: Flashlight, private vibration: Vibration) {
  }

  async presentToast(duracion: number, message: string, clase: string, posicion: 'top' | 'bottom' | 'middle') {
    const toast = await this.toastController.create({
      message,
      duration: duracion,
      cssClass: clase,
      position: posicion
    });
    toast.present();
  }

  async logout() {
    await this.authService.logout();
    localStorage.clear();
    setTimeout(() => {
      this.router.navigateByUrl('/login', { replaceUrl: true })
    }, 500);
  }

  guardarUsuarioActual() {
    const usuarioLS = JSON.parse(localStorage.getItem('usuario'));
    this.dbService.obtenerDatos('usuarios').subscribe(usuarios => {
      usuarios.forEach((usuario: any) => {
        if (usuario.uid == usuarioLS.uid) {
          this.usuarioActual = usuario;
        }
      })
    })
  }

  modificarEstado() {
    if (this.estado) {
      this.estado = false;
      this.activarAlarma();
      this.guardarUsuarioActual();
    } else {
      Swal.fire({
        html:
          '<h4 class="mt-0 mb-3 fw-bold">Ingrese la contraseña de su cuenta para desactivar la alarma</h4>' +
          '<div class="input-group">' +
          '<input class="form-control border border-primary ps-3" type="password" id="input-pw"/>' +
          '<span class="input-group-text p-2">' +
          '<button class="btn btn-swal2 p-2" id="btn-enviar">' +
          '<img src="../../assets/images/send.png" width="30px">' +
          '</button></span></div>',
        heightAuto: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        showClass: {
          backdrop: 'backdrop'
        },
        didOpen: () => {
          const btn = Swal.getHtmlContainer().querySelector('#btn-enviar');
          const input = <HTMLInputElement>Swal.getHtmlContainer().querySelector('#input-pw');
          btn.addEventListener("click", () => {
            if (input.value == this.usuarioActual.clave) {
              this.desactivarAlarma();
            } else {
              this.claveErronea();
            }
            Swal.close();
          });
        },
      })
    }
  }

  activarAlarma() {
    this.deviceMotionSub = this.deviceMotion.watchAcceleration({ frequency: 200 }).subscribe((acceleration: DeviceMotionAccelerationData) => {
      if (acceleration.x > 5
        && (acceleration.y < 3 && acceleration.y > -3)
        && this.posicion != 'izquierda') {
        this.posicion = 'izquierda';
        new Audio('../../assets/audio/fort.mp3').play();
      } else if
        (acceleration.x < -5
        && (acceleration.y < 3 && acceleration.y > -3)
        && this.posicion != 'derecha') {
        this.posicion = 'derecha';
        new Audio('../../assets/audio/no-me-toques.mp3').play();
      } else if
        (acceleration.y > 8 && this.posicion != 'vertical') {
        this.posicion = 'vertical';
        this.flashlight.switchOn();
        const sirena3 = new Audio('../../assets/audio/sirena3.mp3');
        sirena3.play();
        setTimeout(() => {
          this.flashlight.switchOff();
          sirena3.pause();
        }, 5000);
      } else if
        ((acceleration.y < 0.5 && acceleration.y > -0.5)
        && (acceleration.x < 0.5 && acceleration.x > -0.5)
        && this.posicion != 'horizontal') {
        this.posicion = 'horizontal';
        this.vibration.vibrate(5000);
        const sirena2 = new Audio('../../assets/audio/sirena2.mp3');
        sirena2.play();
        setTimeout(() => {
          sirena2.pause();
        }, 5000);
      }
    });
  }

  claveErronea() {
    this.presentToast(5000, 'Clave incorrecta', 'toast-error', 'middle');
    this.vibration.vibrate(5000);
    this.flashlight.switchOn();
    new Audio('../../assets/audio/sirena1.mp3').play();
    new Audio('../../assets/audio/sirena2.mp3').play();
    new Audio('../../assets/audio/sirena3.mp3').play();
    setTimeout(() => {
      this.flashlight.switchOff();
    }, 5000);
  }

  desactivarAlarma() {
    this.deviceMotionSub.unsubscribe();
    new Audio('../../assets/audio/confirmacion.mp3').play();
    this.presentToast(2000, 'Se desactivo con exito la alarma', 'toast-success', 'middle');
    this.estado = true;
  }
}
