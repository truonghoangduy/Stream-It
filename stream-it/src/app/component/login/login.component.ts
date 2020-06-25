import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { LoginService } from 'src/app/login.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { SignUpDialogComponent } from 'src/app/dialog/room-detail-dialog/sign-up-dialog/sign-up-dialog.component';
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  // LoginForm = new FormGroup({
  //   email: new FormControl(''),
  //   password: new FormControl(''),
  // })
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();
  UserInfo: any;
  constructor(private authService: LoginService,private router:Router,private dialog:MatDialog) { }

  ngOnInit(): void {
  }

  async loginWithGoogle() {
    await this.authService.login();
    await this.authService.auth.currentUser.then((user) => {
      this.UserInfo = user;
    })
    this.loginCongratuation()
  }

  loginCongratuation() {
    Swal.fire({
      icon: 'success',
      title: "Login Sucessfully",
      text: `${this.UserInfo.email}`,
      timer: 2000,
    }).then(result=>{
      this.router.navigate(["/checkin"])
    })
  }

  failLogin() {
    Swal.fire({
      icon: 'error',
      title: "Login Fail",
      text: `Invalid User`,
      timer: 2000,
    })
  }
  openSignUpDialog() {
    let dialogConfig = new MatDialogConfig();
    // dialogConfig.height = '50vw';
    dialogConfig.width = '50vw';
    let dialogRef = this.dialog.open(SignUpDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( async (result)=>{
      if (result != null) {
        console.log(result);
        let displayname = `${result.lastName} ${result.firstName}`
        // {firstName: "duy", lastName: "dep", email: "wechicken111@gmail.com", password: "1234567890", confirmPassword: "1234567890"}
        this.signupwithEmailPass(result.email,result.password,displayname).then(()=>{
          Swal.fire({
            icon:"success",
            text:`Sign up when successfully`
          })
        },(reject)=>{
          console.log(reject)
          Swal.fire("Cannot Register user 500");
        })
      }else{
        console.log("click out side");
      }
    })
  }



  async signupwithEmailPass(email:string,password:string,username:string){
    await this.authService.signUpwithEmailPass(email,password,username)
  }


  async onEmailPassLogin() {
    try {
      console.log(`${this.email} : ${this.password}`)
      await this.authService.sighInwithEmailPass(this.email, this.password);
      await this.authService.auth.currentUser.then((user) => {
        this.UserInfo = user;
        this.loginCongratuation();
      });

    } catch (error) {
      console.log(error);
      console.log("Fail to login");
      this.failLogin();
    }
  }

}
