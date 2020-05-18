import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as app from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(public auth:AngularFireAuth) { }

  user:any;
  async login(){
    var provider = await new app.auth.GoogleAuthProvider();
    var credentail = await this.auth.signInWithPopup(provider)
    this.user=credentail.user;
    console.log(this.user.photoURL);
    console.log(this.user);
  }
  logout() {
    this.auth.signOut();
  }
}
