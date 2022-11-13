import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DataUsuarioService } from './data-usuario.service';

@Injectable({
  providedIn: 'root'
})


export class PushNotificationService {
  subUser: Subscription;
  subPush: Subscription;
  private user;

  constructor(
    private platform: Platform,
    private firestore: Firestore,
    private http: HttpClient,
    private router: Router,
    private duService: DataUsuarioService
  ) { }

  sendPush(tokens, oneTitle, oneBody, data) {
    this.subPush = this.sendPushNotifications({
      registration_ids: tokens,
      notification: {
        title: oneTitle,
        body: oneBody
      },
      data: data,
    }).subscribe((data) => {
      console.log(data);
      this.subPush.unsubscribe();
    });
  }

  async inicializar(): Promise<void> {
    this.addListeners();
    if (this.platform.is('capacitor')) {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
      }
    }
  }

  getUser(idField: string): void {
    var ruta = 'users/' + idField;
    const aux = doc(this.firestore, ruta);
    this.subUser = docData(aux, { idField: 'id' }).subscribe(async (user) => {
      this.user = user;
      this.inicializar();
      this.subUser.unsubscribe();
    });
  }

  sendPushNotifications(req): Observable<any> {
    return this.http.post<Observable<any>>(environment.fcmUrl, req, {
      headers: {
        Authorization: `key=${environment.fcmServerKey}`,
        'Content-Type': 'application/json'
      },
    })
  }

  eliminarToken(idField: string) {
    const userRef = doc(this.firestore, `users/${idField}`);
    return updateDoc(userRef, { token: "" });
  }

  private async addListeners(): Promise<void> {
    await PushNotifications.addListener(
      'registration',
      async (token: Token) => {
        console.log('Registration token: ', token.value);
        const aux = doc(this.firestore, `users/${this.user.id}`);
        await updateDoc(aux, {
          token: token.value
        });
      }
    );

    await PushNotifications.addListener('registrationError', (err) => {
      console.log('Registration error: ', err.error);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        console.log('data: ', notification.data);
        LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || '',
              body: notification.body || '',
              id: new Date().getMilliseconds(),
              extra: {
                data: notification.data
              }
            }
          ]
        });
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        //this.redireccion(notification.notification.data.operacion);
        console.log('Push Notification Action Performed: ',
          notification.actionId,
          notification.notification
        );
      }
    );

    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notificationAction) => {
        //this.redireccion(notificationAction.notification.extra.data.operacion);
        console.log('Local Notification Action Performed: ', notificationAction);
      }
    );
  }

  private redireccion(operacion) {
    switch (operacion) {
      case 'NuevoMensaje':
        this.duService.setOpenModal = true;
        this.router.navigateByUrl('/home-mozo', { replaceUrl: true });
        break;
      case 'ListaEspera':
        this.router.navigateByUrl('/lista-espera', { replaceUrl: true });
        break;
      case 'PedidoListo':
        this.router.navigateByUrl('/mozo-ver-pedido', { replaceUrl: true });
        break;
      case 'PedidoPendiente':
        this.duService.setOpenModal = true;
        this.router.navigateByUrl('/home-cocina', { replaceUrl: true });
        break;
      case 'AltaCliente':
        this.router.navigateByUrl('/listado-clientes', { replaceUrl: true });
        break;
    }
  }
}
