import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public formLogin: FormGroup;
  subUsuarios: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private fb: FormBuilder,
    private dbService: DbService
  ) { }

  ngOnInit() {
    this.formLogin = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    )
  }

  get email() {
    return this.formLogin.get('email');
  }

  get password() {
    return this.formLogin.get('password');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2500
    });
    toast.present();
  }

  async login() {
    this.loadingController.create({
      message: '<img src="../../assets/images/iconoSolo.png">',
      spinner: null,
      duration: 2000,
      cssClass: 'loader-css-class',
    }).then(response => {
      response.present();
      response.onDidDismiss().then(() => {
        this.authService.login(this.formLogin.value).then(user => {
          if (user) {
            this.guardarUsuarioLS(user);
            this.presentToast('Bienvenido ' + this.email.value + '!', 'success');
            this.router.navigateByUrl('home');
          } else {
            this.presentToast('Error al ingresar!', 'danger');
          }
        });
      });
    });
  }

  private guardarUsuarioLS(user) {
    this.subUsuarios = this.dbService.obtenerDatos('usuarios').subscribe(usuarios => {
      usuarios.forEach((usuario: any) => {
        if (usuario.uid == user.user.uid) {
          let usuarioLS = { nombre: usuario.nombre, perfil: usuario.perfil, correo: usuario.correo, uid: usuario.uid };
          localStorage.setItem('usuario', JSON.stringify(usuarioLS));
        }
      })
      this.subUsuarios.unsubscribe();
    })
  }

  accesoRapido() {
    let rango = <HTMLInputElement>document.getElementById('customRange');
    switch (rango.value) {
      case '1':
        this.email.setValue("admin@admin.com");
        this.password.setValue("111111");
        break;
      case '2':
        this.email.setValue("invitado@invitado.com");
        this.password.setValue("222222");
        break;
      case '3':
        this.email.setValue("usuario@usuario.com");
        this.password.setValue("333333");
    }
  }

}
