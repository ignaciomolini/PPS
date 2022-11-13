import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Mensaje } from '../interfaces/mensaje';


@Injectable({
  providedIn: 'root'
})
export class DbService {

  itemsCollection?: AngularFirestoreCollection<Mensaje>;

  constructor(private afs: AngularFirestore) {
  }

  obtenerDatos(ruta: string) {
    return this.afs.collection(ruta).valueChanges();
  }

  cargarMensajes(ruta: string) {
    this.itemsCollection = this.afs.collection<Mensaje>(ruta, ref => ref.orderBy('fecha', 'desc').limit(10));
    return this.itemsCollection.valueChanges().pipe(map((mensajes: Mensaje[]) => {
      const chats = [];
      for (let mensaje of mensajes) {
        chats.unshift(mensaje);
      }
      return chats;
    }));
  }

  agregarMensaje(texto: string, nombreUsuario: string, uidUsuario: string) {
    let mensaje: Mensaje = {
      nombre: nombreUsuario,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: uidUsuario
    }
    return this.itemsCollection?.add(mensaje);
  }
}
