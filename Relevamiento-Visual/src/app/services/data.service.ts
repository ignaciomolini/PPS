import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private tipo = new BehaviorSubject<string>('');
  private fotos = new BehaviorSubject<any>([]);

  constructor() { }

  public tipo$ = this.tipo.asObservable();
  public fotos$ = this.fotos.asObservable();
  
  set setTipo(tipo: string){
    this.tipo.next(tipo);
  }

  set setFotos(foto: any){
    this.fotos.next(foto);
  }
}


