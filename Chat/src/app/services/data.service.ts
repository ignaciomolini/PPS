import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private curso = new BehaviorSubject<string>('');

  constructor() { }

  public curso$ = this.curso.asObservable();
  
  set setCurso(curso: string){
    this.curso.next(curso);
  }
}


