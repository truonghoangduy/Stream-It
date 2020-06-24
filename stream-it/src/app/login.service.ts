import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as app from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(public auth:AngularFireAuth,private afs:AngularFirestore) { }

  user:any;
  async pushUserInfoToFS(){
   await this.afs.collection("user").doc(this.user.email).set({});
  }
  async login(){
    await this.auth.signOut()
    var provider = await new app.auth.GoogleAuthProvider();
    var credentail = await this.auth.signInWithPopup(provider)
    this.user=credentail.user;
    await this.pushUserInfoToFS();
  }
  logout() {
    this.auth.signOut();
  }

  async signUpwithEmailPass(email:string,password:string ){
    let userWithEmailPass = await this.auth.createUserWithEmailAndPassword(email,password);
    this.user = userWithEmailPass;
    console.log(`Create ${userWithEmailPass.user.email} with Email and Pass`)
  }
  async sighInwithEmailPass(email:string,password:string ){
    console.log(`in side auth ${email} : ${password}`)
    let userWithEmailPass = await this.auth.signInWithEmailAndPassword(email,password);

    if (userWithEmailPass == null) {
      console.log("wrong Email");
    }
    this.user = userWithEmailPass.user;
    await this.pushUserInfoToFS();
    console.log(`Login ${userWithEmailPass.user.email} with Email and Pass`)
  }
}
