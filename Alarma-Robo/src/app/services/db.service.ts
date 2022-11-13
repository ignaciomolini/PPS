import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private afs: AngularFirestore) { }

  obtenerDatos(ruta: string) {
    return this.afs.collection(ruta).valueChanges();
  }
}
