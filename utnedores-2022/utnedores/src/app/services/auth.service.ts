import { Injectable } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { query, where, Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { deleteObject, listAll, getDownloadURL, uploadString } from '@angular/fire/storage';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Local {
	idLocal: string;
	qr: string;
}

export interface Usuario {
	idField: string;
	idUsuario: string;
	nombre: string;
	apellido: string;
	correo: string;
	clave: string;
	dni: string;
	cuil: string;
	foto: string;
	perfil: string;
	tipo: string;
	aprobado: string;
	token: string;
}

export interface Espera {
	idField: string;
	idEspera: string,
	idUsuario: string;
	nombre: string;
	apellido: string;
	foto: string;
	fecha: string;
	hora: string;
	cantPersonas: string;
	preferencia: string;
}

export interface Mesa {
	idField: string;
	numMesa: string;
	qr: string;
	capacidad: string;
	tipo: string;
	foto: string;
	idMozo: string;
	idUsuario: string;
	cuenta: string;
	pedirCuenta: string;
}

export interface Producto {
	idField: string;
	idProducto: string;
	categoria: string;
	producto: string;
	tamanio: string;
	descripcion: string;
	tiempoElaboracion: string;
	foto1: string;
	foto2: string;
	foto3: string;
	precio: string;
	qr: string;
}

export interface Pedido {
	idPedido: string;
	idField: string;
	numMesa: string;
	productos: string;
	fecha: string;
	hora: string;
	estado: string;
	listoCocinero: string;
	listoBartender: string;
	idUsuario: string;
}

export interface Propina {
	idField: string;
	idUsuario: string;
	valor: string;
}

export interface Cuenta {
	idField: string;
	idUsuario: string;
	total: string;
	propina: string;
	mesas: string;
}

export interface ReservaNoConfirmada {
	idField: string;
	idUsuario: string;
	cantPersonas: string;
	hora: string;
	fecha: string;
}

export interface ReservaAsignada {
	idField: string;
	numMesa: string;
	idUsuario: string;
	fecha: string;
	hora: string;
}

export interface EncuestaCliente {
	fecha: string;
	idUsuario: string;
	idEncuesta: string;
	atencion: string;
	precioCalidad: string;
	ambiente: string;
	limpieza: string;
	rapidez: string;
	foto1: string;
	foto2: string;
	foto3: string;
}

export interface EncuestaEmpleado {
	idUsuario: string;
	idEncuesta: string;
	ambiente: string;
	orden: string;
	limpieza: string;
	estadoCocina: string;
	estadoBanios: string;
	foto1: string;
}

export interface EncuestaSupervisor {
	idEncuesta: string;
	amable: string;
	respeto: string;
	paciencia: string;
	simpatia: string;
	higiene: string;
	idUsuario: string;
}

export interface Mensaje {
	usuario: any;
	mensaje: string;
	fecha: number;
}

@Injectable({
	providedIn: 'root'
})

export class AuthService {

	constructor(
		private auth: Auth,
		private firestore: Firestore,
		private http: HttpClient
	) {}

	eliminarCuenta(idField: string) {
		const cuentaDocRef = doc(this.firestore, `cuentas/${idField}`);
		return deleteDoc(cuentaDocRef);
	}

	cerrarCuenta(idField: string) {
		const cuentaRef = doc(this.firestore, `cuentas/${idField}`);
		return updateDoc(cuentaRef, { idUsuario: "-1"});
	}

	traerCuentas(): Observable<Cuenta[]> {
		const cuentaRef = collection(this.firestore, 'cuentas');
		return collectionData(cuentaRef, { idField: 'idField' }) as Observable<Cuenta[]>;
	}

	agregarCuenta(cuenta: Cuenta) {
		const cuentaRef = collection(this.firestore, 'cuentas');
		return addDoc(cuentaRef, cuenta);
	}

	agregarEncuestaCliente(encuesta: EncuestaCliente) {
		const encuestaRef = collection(this.firestore, 'encuestascliente');
		return addDoc(encuestaRef, encuesta);
	}

	traerEncuestaCliente(): Observable<EncuestaCliente[]> {
		const encuestaRef = collection(this.firestore, 'encuestascliente');
		return collectionData(encuestaRef) as Observable<EncuestaCliente[]>;
	}

	agregarEncuestaEmpleado(encuesta: EncuestaEmpleado) {
		const encuestaRef = collection(this.firestore, 'encuestasempleado');
		return addDoc(encuestaRef, encuesta);
	}

	traerEncuestaEmpleado(): Observable<EncuestaEmpleado[]> {
		const encuestaRef = collection(this.firestore, 'encuestasempleado');
		return collectionData(encuestaRef) as Observable<EncuestaEmpleado[]>;
	}

	agregarEncuestaSupervisor(encuesta: EncuestaSupervisor) {
		const encuestaRef = collection(this.firestore, 'encuestassupervisor');
		return addDoc(encuestaRef, encuesta);
	}

	traerEncuestaSupervisor(): Observable<EncuestaSupervisor[]> {
		const encuestaRef = collection(this.firestore, 'encuestassupervisor');
		return collectionData(encuestaRef) as Observable<EncuestaSupervisor[]>;
	}

	traerPedidos(): Observable<Pedido[]> {
		const pedidoRef = collection(this.firestore, 'pedidos');
		return collectionData(pedidoRef, { idField: 'idField' }) as Observable<Pedido[]>;
	}

	eliminarPedido(idField: string) {
		const pedidoDocRef = doc(this.firestore, `pedidos/${idField}`);
		return deleteDoc(pedidoDocRef);
	}

	agregarPedido(pedido: Pedido) {
		const pedidoRef = collection(this.firestore, 'pedidos');
		return addDoc(pedidoRef, pedido);
	}

	rechazarPedido(idField: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { estado: 'Rechazado', listoCocinero: '-2', listoBartender: '-2' });
	}

	confirmarPedido(idField: string, productosActualizados: string, lCocinero: string, lBartender: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { estado: 'Confirmado', productos: productosActualizados, listoCocinero: lCocinero, listoBartender: lBartender});
	}

	pedidoRecibido(idField: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { estado: 'Recibido'});
	}

	listoCocinero(idField: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { listoCocinero: "1"});
	}

	listoBartender(idField: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { listoBartender: "1"});
	}

	pedidoPreparadoCocinero(idField: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { estado: 'Preparado', listoCocinero: "1"});
	}

	pedidoPreparadoBartender(idField: string) {
		const pedidoRef = doc(this.firestore, `pedidos/${idField}`);
		return updateDoc(pedidoRef, { estado: 'Preparado', listoBartender: "1"});
	}

	cargarMensajes(ruta: string): Observable<Mensaje[]> {
		const msjRef = collection(this.firestore, ruta);
		const q = query(msjRef, orderBy("fecha", "desc"), limit(10));
		return (collectionData(q) as Observable<Mensaje[]>).pipe(map((mensajes: Mensaje[]) => {
			const chat = [];
			for (let mensaje of mensajes) {
				chat.unshift(mensaje);
			}
			return chat;
		}));
	}

	agregarMensaje(mensaje: Mensaje, ruta: string) {
		const msjRef = collection(this.firestore, ruta);
		return addDoc(msjRef, mensaje);
	}

	enviarCorreo(dataToSend){
		return this.http.post(environment.url, dataToSend,
		{headers:new HttpHeaders(
		{"content-Type":"application/json"})});
	}

	async getUser(correo) {
		const userRef = collection(this.firestore, 'users');
		const q = query(userRef, where("correo", "==", correo));
		return (await getDocs(q)).docs[0].data();
	}

	eliminarEspera(idField: string) {
		const esperaDocRef = doc(this.firestore, `listaespera/${idField}`);
		return deleteDoc(esperaDocRef);
	}

	modificarEspera(idField: string, num: string) {
		const espDoc = doc(this.firestore, `listaespera/${idField}`);
		return updateDoc(espDoc, { cantPersonas: num });
	}

	agregarEspera(espera: Espera) {
		const esperaRef = collection(this.firestore, 'listaespera');
		return addDoc(esperaRef, espera);
	}

	listaEspera(): Observable<Espera[]> {
		const listaRef = collection(this.firestore, 'listaespera');
		return collectionData(listaRef, { idField: 'idField' }) as Observable<Espera[]>;
	}

	aceptarUsuario(idField) {
		const userDoc = doc(this.firestore, `users/${idField}`);
		return updateDoc(userDoc, { aprobado: 'Si' });
	}

	rechazarUsuario(idField) {
		const userDoc = doc(this.firestore, `users/${idField}`);
		return updateDoc(userDoc, { aprobado: '0' });
	}

	usuarioActual() {
		return this.auth.currentUser.email;
	}

	obtenerAuth(){
		return getAuth();
	}

	addUser(user: Usuario) {
		const userRef = collection(this.firestore, 'users');
		return addDoc(userRef, user);
	}

	getUsers(): Observable<Usuario[]> {
		const userRef = collection(this.firestore, 'users');
		return collectionData(userRef, { idField: 'idField' }) as Observable<Usuario[]>;
	}


	subirImagenBase64(nombreImagen, base64Image) {
		const storage = getStorage();
		const storageRef = ref(storage, nombreImagen);
		uploadString(storageRef, base64Image, 'data_url').then((snapshot) => {

		});
	}

	subirImagenFile(nombreImagen, file) {
		const storage = getStorage();
		const storageRef = ref(storage, nombreImagen);
		uploadBytes(storageRef, file).then((response) => {
		});
	}

	liberarMesa(idField: string){
		const espDoc = doc(this.firestore, `mesas/${idField}`);
		return updateDoc(espDoc, {idUsuario: "0"});
	}

	asignarMesa(idField: string, idUsuario: string){
		const espDoc = doc(this.firestore, `mesas/${idField}`);
		return updateDoc(espDoc, {idUsuario: idUsuario,cuenta: "0", pedirCuenta: "No" });
	}

	addTable(mesa: Mesa) {
		const tableRef = collection(this.firestore, 'mesas');
		return addDoc(tableRef, mesa);
	}

	getTables(): Observable<Mesa[]> {
		const mesaRef = collection(this.firestore, 'mesas');
		return collectionData(mesaRef, { idField: 'idField' }) as Observable<Mesa[]>;
	}

	addProduct(producto: Producto) {
		const productRef = collection(this.firestore, 'productos');
		return addDoc(productRef, producto);
	}

	getProducts(): Observable<Producto[]> {
		const productRef = collection(this.firestore, 'productos');
		return collectionData(productRef, { idField: 'idField' }) as Observable<Producto[]>;
	}

	async ingresoAnonimo({ emailNuevo, passwordNuevo }) {
		try {
			const user = await createUserWithEmailAndPassword(this.auth, emailNuevo, passwordNuevo);
		} catch (e) {
			return null;
		}
	}

	async register({ emailNuevo, passwordNuevo }, { emailCurrent, passwordCurrent }) {
		try {
			const user = await createUserWithEmailAndPassword(this.auth, emailNuevo, passwordNuevo);
			setTimeout(() => {
				this.logout();
				setTimeout(() => {
					if (emailCurrent != "") {
						this.login({ email: emailCurrent, password: passwordCurrent });
					}
				}, 2500);
			}, 3000);
		} catch (e) {
			return null;
		}
	}

	async login({ email, password }) {
		try {
			const user = await signInWithEmailAndPassword(this.auth, email, password);
			return user;
		} catch (e) {
			return null;
		}
	}

	logout() {
		return signOut(this.auth);
	}

}
