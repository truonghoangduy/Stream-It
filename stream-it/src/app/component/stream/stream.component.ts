import { Component, Inject, OnInit, Input, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { StreamingService } from 'src/app/streaming.service';
import { ActivatedRoute, Router } from "@angular/router";
// import * as Peers from 'peerjs'
// declare var Peer: any;
import { AngularFireAuth } from '@angular/fire/auth';
import Peer from 'peerjs'
import { RoomViewMode } from 'src/app/typepo/roomConfig';
import { Subject } from 'rxjs';
// import {Component, Inject} from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RoomDetailDialogComponent } from 'src/app/dialog/room-detail-dialog/room-detail-dialog.component';
import Swal from 'sweetalert2';
@Component({
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})

export class StreamComponent implements OnInit, AfterViewInit, OnDestroy {
  RoomViewMode = RoomViewMode;
  videoConfig = { video: true, audio: false };
  roomVeiwMode: RoomViewMode
  // @Input() 
  roomURL: String;
  myColor: String;
  value: String;
  peer;
  anotherid;
  mypeerid;
  peerid: string;
  otherpeerid: string;
  roomCheck = new Subject<boolean>()


  @ViewChild('focusVideo', { static: false }) focusedVideoElement: ElementRef;
  @ViewChild('myVideo', { static: true }) myVideoElement: ElementRef;

  @ViewChild('otherVideo', { static: true }) otherVideoElement: ElementRef;

  constructor(public dialog: MatDialog,
    public streaming: StreamingService, private route: ActivatedRoute, private auth: AngularFireAuth, private router: Router) {
    this.route.paramMap.subscribe(async (params) => {
      // http://localhost:4200/room/12345678 
      // ipconfig getifaddr en0
      this.roomCheck.subscribe(async (flag)=>{
        console.log("Call Room check");
        if (flag) {
         await this.roomNotFound();
        }
      })
      // Params map -> quick room access
      let id = params.get("id")
      if (id != "" && id != null) {
        console.log(`Room ID : ${id}`)
        if (this.streaming.roomRef == undefined || this.streaming.roomRef == null) {
          if (await this.streaming.getRoomRef(id)) {
            // this.connected();
            
          } else {
            console.log("Room not found") 
            await Swal.fire({
              title: "Room not found",
              icon: "warning",
            }).then(async (result) => {
              if (result.isDismissed || result.isConfirmed) {
                console.log("Dissmised NO ROOM FOUND");
                this.roomCheck.next(true);
              }
            })
          }
        }
        // this.streaming.joinRoom(id)
        // Join Room Request
      }


    }
    )

  }


  // "ssl": true,
  // "sslCert": "domain.crt",
  // "sslKey": "domain.key"


  /// JSON Room
  // roomID:"uid Generate with host uid ? same at host ?"
  // host:"uid" | has key to give some one eles be a host
  // ---- Host can kick some one | block acces to room | add key
  // paticipent:[
  // host and peer : uuid
  //]
  ///

  async roomNotFound() {
    await this.router.navigate([""]);
  }

  ngAfterViewInit(): void {
    // throw new Error("Method not implemented.");
  }
  // option:Peer.PeerJSOption
  ngOnInit() {
    // this.streaming.peer
  }
  // startPeerJS() {
  //   this.streaming.startPeerJS(this.peerid)
  // }

  callPeerJs() {
    this.streaming.callPeerJs(this.otherpeerid);
  }

  // callPeer(stream?: MediaStream) { // Passing your stream to other
  //   let call = this.peer.call(this.otherpeerid, stream);
  //   call.on('stream', (remoteStream) => {
  //     this.otherVideoElement.nativeElement.srcObject = remoteStream;
  //   })

  // }
  navigateee() {
    this.router.navigate([""])
  }

  connected() {
    this.streaming.startPeerJS("123");

    // this.focusedVideoElement.nativeElement.srcObject = this.streaming.myVideoMediaStream;
    console.log("Dsadasdsadsadsadasd");
    // const conn = this.peer.connect(this.otherpeerid);
    // conn.on('open', () => {
    //   conn.send('hi!');
    // });
  }
  ngOnDestroy(): void {
    // console.log("invoke onDestroy");
    // if (this.streaming.roomRef != null) {
    //   this.streaming.roomRef.delete();
    // }
  }

  checkURL() {

  }

  closeRoomID() {
    console.log("Closeed");
  }

  asyncjoinRoom(id: string) {
    // console.log(id)
    // this.streaming.joinRoom(id);
  }
  stopUserMedia() {
    this.focusedVideoElement.nativeElement.pause();

  }

  openRoomDetailDialog() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.height = '50vw';
    dialogConfig.width = '50vw';
    this.dialog.open(RoomDetailDialogComponent, dialogConfig);
  }

  async createRoom() {
    await this.streaming.createRoom();
  }

  getUserMedia() {
    navigator.getUserMedia(this.videoConfig, (stream) => {
      // Hmm why use HTMLVideoElement not working Hmmm
      this.focusedVideoElement.nativeElement.srcObject = stream;
      this.streaming.localStream = stream;

      // this.streaming.localStream.getTracks().forEach(track=>{
      //   this.streaming.peerConnection.addTrack(track,this.streaming.localStream)
      // })
      // stream.getTracks().forEach(track=>{
      //   this.streaming.peerConnection.addTrack(track,stream)
      // })
      // Video Tag Auto play
    }, (err) => {
      console.log(err)
    })
  }
}
