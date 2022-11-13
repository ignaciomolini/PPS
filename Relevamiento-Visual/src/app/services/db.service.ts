import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private storage: Storage, private afs: AngularFirestore) { }

  agregarDatos(obj: any, ruta: string) {
    obj.id = this.afs.createId();
    return this.afs.collection(ruta).add(obj);
  }

  obtenerDatos(ruta: string) {
    return this.afs.collection(ruta).valueChanges();
  }

  obtenerDatosOrden(ruta: string, orden: string) {
    return this.afs.collection(ruta, ref => ref.orderBy(orden, 'desc')).snapshotChanges();
  }

  obtenerDatosCompleto(ruta: string) {
    return this.afs.collection(ruta).snapshotChanges();
  }

  modificarDatos(obj: any, ruta: string, id: string) {
    return this.afs.collection(ruta).doc(id).update(obj);
  }

  async subirImagen(imagen: Blob, ruta: string) {
    const imgRef = ref(this.storage, ruta);
    const resp = await uploadBytes(imgRef, imagen)
    return getDownloadURL(resp.ref);
  }
}
