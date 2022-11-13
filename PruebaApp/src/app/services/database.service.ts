import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(public firestore: Firestore) { }

  saveDetails(data) {
    const placeRef = collection(this.firestore, 'users');
    return addDoc(placeRef, data);
  }

  async getUser(uid) {
    const q = query(collection(this.firestore, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    let resp;
    querySnapshot.forEach((doc) => {
      resp = doc.data();
    });
    return resp;
  }
}
