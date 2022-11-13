import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  async login(data){
    try{
      const user = await signInWithEmailAndPassword(this.auth, data.email, data.password);
      return user;
    }
    catch(e){
      return null;
    }
  }

  logout(){
    return signOut(this.auth);
  }
}
