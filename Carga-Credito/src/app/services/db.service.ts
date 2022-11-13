import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private afs: AngularFirestore) { }

  agregarDatos(obj: any, ruta: string) {
    return this.afs.collection(ruta).add(obj);
  }

  obtenerDatos(ruta: string) {
    return this.afs.collection(ruta).valueChanges();
  }

  obtenerDatosCompleto(ruta: string) {
    return this.afs.collection(ruta).snapshotChanges();
  }

  modificarDatos(obj: any, ruta: string, id: string) {
    return this.afs.collection(ruta).doc(id).update(obj);
  }
}
