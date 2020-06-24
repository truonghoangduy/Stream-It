import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MustMatch } from 'src/app/typepo/signupvalidator';

@Component({
  selector: 'app-sign-up-dialog',
  templateUrl: './sign-up-dialog.component.html',
  styleUrls: ['./sign-up-dialog.component.scss']
})
export class SignUpDialogComponent implements OnInit {
  email:string;
  password:string;
  message: string = ""
  cancelButtonText = "Cancel"
  registerForm: FormGroup;
  submitted = false;
  get f() { return this.registerForm.controls; }

  
  signUPForm = new FormGroup({
  })
  emailCheck = new FormControl(
    Validators.required,
    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"),
  )
  passwordCheck = new FormControl(
    Validators.required,
    Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
  // At least one upper case English letter, (?=.*?[A-Z])
  // At least one lower case English letter, (?=.*?[a-z])
  // At least one digit, (?=.*?[0-9])
  // At least one special character, (?=.*?[#?!@$%^&*-])
  // Minimum eight in length .{8,} 
  )
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<SignUpDialogComponent> , private formBuilder: FormBuilder) {
    if (data) {
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
    }
    this.dialogRef.updateSize('300vw','300vw')
  }
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
  }, {
      validator: MustMatch('password', 'confirmPassword')
  });
  }

  onSubmit(){
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }
    this.onConfirmClick(this.registerForm.value)
  }

  onConfirmClick(userData): void {
    if (userData !=null) {
      this.dialogRef.close(
        userData
      );
    }else{
      this.dialogRef.close(null)
    }

  }

  async signUPwithEmailPass() {
    await Swal.fire({
      title:"Sign up form",
      html:'Email'+'<input type="email" id="swal-input1" class="swal2-input">' + 'Password' +
      '<input type="password" id="swal-input2" class="swal2-input">',
      preConfirm: function () {
        return new Promise(function (resolve) {
          resolve([
            // document.getElementById('swal-input1').value,
            // document.getElementById('swal-input2').value,
          ])
        })
      },
    }).then(async function (result) {
      if (result['value'][0].includes("@")) {
        try {
          // await this.signupwithEmailPass(result['value'][0],result['value'][1]);
          Swal.fire(JSON.stringify(result))
        } catch (error) {
          
        }
      }
    }
  )
  }

}
