import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

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
    private databaseService: DatabaseService,
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

  signup(){
    this.router.navigateByUrl('/sign-up', { replaceUrl: true });
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.login(this.formLogin.value);

    if (user) {
      this.databaseService.getUser(user.user.uid).then(res => {
        this.presentToast('Bienvenido ' + res.name +  '!', 'success');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }).catch((e) => {
        console.log(e);
        this.authService.logout();
        this.presentToast('Error al ingresar!', 'danger');
      }).finally(() => {
        loading.dismiss();
      });
    } else {
      this.presentToast('Error al ingresar!', 'danger');
      loading.dismiss();
    }
  }

  accesoRapido(){
    this.email.setValue("admin@gmail.com");
    this.password.setValue("123456");
  }
}
