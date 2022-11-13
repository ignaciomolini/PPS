import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  public formRegister: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private databaseService: DatabaseService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.formRegister = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    )
  }

  get name() {
    return this.formRegister.get('name');
  }

  get email() {
    return this.formRegister.get('email');
  }

  get password() {
    return this.formRegister.get('password');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000
    });
    toast.present();
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.register(this.formRegister.value);

    if (user) {
      const data = {
        email: this.email.value,
        password: this.password.value,
        name: this.name.value,
        uid: user.user.uid
      }
      this.databaseService.saveDetails(data).then(() => {
        this.presentToast('Cuenta creada correctamente!', 'success');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }).catch(() => {
        this.authService.delete();
        this.presentToast('Error al crear cuenta!', 'danger');
      }).finally(() => {
        loading.dismiss();
      });
    }
  }

}
