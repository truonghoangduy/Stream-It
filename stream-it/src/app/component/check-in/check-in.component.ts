import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';
// import {Log} from '../../login.service.spec'
import { User } from 'firebase'
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subject } from 'rxjs'
import { StreamingService } from 'src/app/streaming.service';
import Swal from 'sweetalert2'
import { FindRoomService } from 'src/app/find-room.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RoomInfoDialogComponent } from 'src/app/dialog/room-info-dialog/room-info-dialog.component';
import { DialogRoomData } from 'src/app/typepo/roomConfig';
@Component({
  selector: 'check-in-component',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit {
  roomConfigPassAll = true;
  UserInfo: User;
  urlLink:String;
  domain="https://localhost:4200"
  createRoomObserver:Subject<boolean>;
  timerInterval:any;
  findkeyword:String;
  selectedFilterOption:String;
  roomInfoForMatMenu:any[];
  roomRefForMatMenu:String;
  roomName:String;

  radio_button_checked = {
    "background-color": "greenyellow"
  
  }
  radio_button_unchecked = {
    "background-color":"tomato"
  }
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  constructor(
    public findRoomServices:FindRoomService,
    private roomInfoDialog:MatDialog,
    private streaming: StreamingService, public authService: LoginService, private afire: AngularFirestore, private router: Router) {
    this.createRoomObserver = new Subject<boolean>();
    authService.auth.user.subscribe(
      (userCredentail) => {
        console.log(userCredentail.displayName)
        this.UserInfo = userCredentail;
      }
    
    );//http://localhost:4200/room/2121212211221
    this.urlLink = this.router.url;
    this.createRoomObserver.subscribe((vaule) => {
      if (vaule) {
        this.router.navigate(['room/' + this.streaming.roomRef.path.split("/")[1],]);
      }
    })
    findRoomServices.getAllRoom();

    
  }

  styleSwitch(flag:boolean){
    if (flag) {
      return this.radio_button_checked;
    }
    return this.radio_button_unchecked;
  }


  openDialog(keyCode:string): void {
    const dialogRef = this.roomInfoDialog.open(RoomInfoDialogComponent, {
      width: '50vw',
      // height:'30vw',
      data: {title:keyCode}
    });

    dialogRef.afterClosed().subscribe(async (result:DialogRoomData) => {
      if (result != undefined) {
        console.log(result.mesages)
        if (result.title == "url") {
          //TO DO NAVI TO URL ( JOIN ROOM )
          this.router.navigate(['room/'+result.mesages])
          console.log("Find room Dectr");
        }else if (result.title == "roomName") {
          if (result.mesages == undefined) {
            this.roomName = this.months[Math.floor(Math.random() * this.months.length)];
          }else{
            this.roomName = result.mesages
          }
          await this.createRoom();
        }
      }
    });
  }

  async navigateToRoomWithMatMenu(){

    await Swal.fire({
      icon: "success",
      text: "we will navigate you in a bit",
      title:"Getting your meet really",
      // background:'url(../../assets/macos-wall.jpg)',
      // imageWidth:400,
      // imageHeight:400,
      timer: 3000,
      timerProgressBar: true,
      onBeforeOpen: () => {
        Swal.showLoading()
        this.timerInterval = setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b) {
              b.textContent = Swal.getTimerLeft().toString();
            }
          }
        }, 100)
      },
      onClose: () => {
        clearInterval(this.timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
        this.router.navigate(['room/'+this.roomRefForMatMenu])
      }
    })

  }

  ngOnInit(): void {
  }
  async roomConfig(condiction: boolean) {
    if (this.UserInfo != null) {
      if (condiction) {
        this.roomConfigPassAll = condiction;
      } else {
        this.roomConfigPassAll = condiction;
      }
      this.openDialog("roomName")
    } else {
      this.unLoginCreateRoom();
    }

  }

  async roomJoomTo() {
    await Swal.fire({
      // icon: "success",
      text: "we will navigate you in a bit",
      // title:"Created your Hangout",
      timer: 3000,
      timerProgressBar: true,
      onBeforeOpen: () => {
        Swal.showLoading()
        this.timerInterval = setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b) {
              b.textContent = Swal.getTimerLeft().toString();
            }
          }
        }, 100)
      },
      onClose: () => {
        clearInterval(this.timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
        this.navigateToRoom()
      }
    })
  }

  // ${this.domain}${this.urlLink}${this.streaming.roomRef.path}
  // <input id="inputFrome" value=""></input>
  async roomInfo() {
    await Swal.fire({
      icon: "success",
      text: "we will navigate you in a bit",
      title:"Created your Hangout",
      timer: 3000,
      timerProgressBar: true,
      onBeforeOpen: () => {
        Swal.showLoading()
        this.timerInterval = setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b) {
              b.textContent = Swal.getTimerLeft().toString();
            }
          }
        }, 100)
      },
      onClose: () => {
        clearInterval(this.timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
        this.navigateToRoom()
      }
    })
  }



  roomInfoPassDownToMatMenu(roomInfo){
    let temperRoomInfo=[]
    temperRoomInfo.push(`Host : ${roomInfo['host']}`);
    if (roomInfo['candidates'] != undefined) {
      temperRoomInfo.push(`Participants : ${roomInfo['candidates'].lenght}`)
    }
    temperRoomInfo.push(`Allow guest ${roomInfo['roomConfig']}`)
    this.roomInfoForMatMenu = temperRoomInfo;
    this.roomRefForMatMenu = roomInfo['roomRef'];

  }

  async createRoom() {
    let roomConfigData = {
      "host": this.UserInfo.email ? this.UserInfo.email : "guestTEST",
      "roomConfig": this.roomConfigPassAll,
      "banned":[],
      "roomName":this.roomName
    }
    let roomRef = await this.afire.collection("rooms").add(roomConfigData)
    console.log(roomRef.id)
    await roomRef.update({'roomRef':roomRef.id})
    
    this.streaming.roomRef = roomRef;
    console.log(roomRef.path);
    // await this.createRoom();
    this.roomInfo();
  }

  navigateToRoom() {
    this.createRoomObserver.next(true);
  }

  async login() {
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
      timer: 2000,
    })
  }

  async unLoginCreateRoom() {
    // Swal.disableButtons();

    await Swal.fire(
      {
        // title: 'Auto close alert!',
        icon: 'error',
        text: 'You has to Sign In create a confrences',
        timer: 4000,
        showConfirmButton: false,
        focusConfirm: false,
        buttonsStyling: false,
        showCancelButton: false,
        allowOutsideClick: true,
      }
    )
  }



  loginAsGuest() {
    this.UserInfo = null;
  }



}
