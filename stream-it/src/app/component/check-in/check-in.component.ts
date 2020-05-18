import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';
// import {Log} from '../../login.service.spec'
import {User} from 'firebase'
import { Observable } from 'rxjs';
@Component({
  selector:'check-in-component',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit {

  UserInfo:User;
  constructor(public authService:LoginService) { 

    authService.auth.user.subscribe(
      (userCredentail)=>{
        console.log(userCredentail.displayName)
        this.UserInfo = userCredentail;
      }
    )
  }

  ngOnInit(): void {
  }

  login(){
    this.authService.login();
  }

  loginAsGuest(){
    this.UserInfo = null;
  }

}
