import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  async register(data){
    try{
      const user = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
      return user;
    }
    catch(e){
      return null;
    }
  }

  async login(data){
    try{
      const user = await signInWithEmailAndPassword(this.auth, data.email, data.password);
      return user;
    }
    catch(e){
      return null;
    }
  }

  async delete(){
    await deleteUser(this.auth.currentUser);
  }

  logout(){
    return signOut(this.auth);
  }
}
