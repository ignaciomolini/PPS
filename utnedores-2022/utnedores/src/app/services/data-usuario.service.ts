import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataUsuarioService {
  private usuario = new BehaviorSubject<Usuario>({
    idField: "0", idUsuario: "0", nombre: "0", apellido: "0",
    correo: "0", clave: "0", dni: "0", cuil: "0", foto: "0", perfil: "0", tipo: "0", aprobado: "0", token: ""
  });
  private idUsuarioPedido = new BehaviorSubject<string>('');
  private openModal = new BehaviorSubject<boolean>(false);

  constructor() { }

  public usuario$ = this.usuario.asObservable();
  public idUsuarioPedido$ = this.idUsuarioPedido.asObservable();
  public openModal$ = this.openModal.asObservable();

  set setOpenModal(estado: boolean) {
    this.openModal.next(estado);
  }

  set setUsuario(usuario: Usuario) {
    this.usuario.next(usuario);
  }

  set setIdUsuarioPedido(id: string) {
    this.idUsuarioPedido.next(id);
  }
}
