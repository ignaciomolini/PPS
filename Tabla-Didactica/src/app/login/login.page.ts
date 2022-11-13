import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public formLogin: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private fb: FormBuilder
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
      duration: 2000
    });
    toast.present();
  }

  async login() {
    this.loadingController.create({
      message:'<img src="../../assets/images/iconoSolo.png">',
      spinner: null,
      duration: 2000,
      cssClass: 'loader-css-class',
    }).then(response => {
      response.present();
      response.onDidDismiss().then(() => {
        this.authService.login(this.formLogin.value).then(user => {
          if (user) {
            this.presentToast('Bienvenido ' + this.email.value + '!', 'success');
            this.router.navigateByUrl('home');
          } else {
            this.presentToast('Error al ingresar!', 'danger');
          }
        });
      });
    });
  }

  accesoRapido(valor) {
    switch (valor) {
      case 'admin':
        this.email.setValue("admin@admin.com");
        this.password.setValue("111111");
        break;
      case 'invitado':
        this.email.setValue("invitado@invitado.com");
        this.password.setValue("222222");
        break;
      case 'usuario':
        this.email.setValue("usuario@usuario.com");
        this.password.setValue("333333");
        break;
    }
  }
}
