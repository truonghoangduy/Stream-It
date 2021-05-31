import { Injectable, ViewChild, ViewChildren } from '@angular/core';
// import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http'
import { AngularFirestore, DocumentReference, CollectionReference, AngularFirestoreCollection } from '@angular/fire/firestore/';
import { ThrowStmt } from '@angular/compiler';
import { LoginService } from './login.service';
import { async } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

// import * as Peers from 'peerjs'
// import Peer from 'peerjs'
// PeerJS
// declare var Peer: any;
import Peer from 'peerjs'
import { User } from 'firebase';
// Turn of import by angular it wokring lib in services
// "./node_modules/peerjs/dist/peerjs.min.js"

//"./node_modules/peerjs/dist/peerjs.min.js"

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.example.com', 'stun:stun-1.example.com'] },
  { urls: 'stun:stun.l.google.com:19302' }
];

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 10,


};
export interface callerCandidates {
  connectionState: boolean,
}
export interface PeerMediaStream {
  peerID?: String;
  mediaStream?: MediaStream;
}
@Injectable({
  providedIn: 'root'
})
export class StreamingService implements StreamingServiceInterface {
  videoConfig = { video: true, audio: false };
  constraints = {
    'mandatory': {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true
    },
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1,
  }
  UserInfo: User;
  remoteStream: MediaStream
  localStream: MediaStream
  roomId: String
  otherUserMedia: MediaStream[];
  roomSetUpObserver: Subject<boolean>
  myWebRTuuid: String;
  otherVideoElement: MediaStream;
  myVideoMediaStream: MediaStream;
  peer: Peer;
  peerList: any;
  candidateList = {};
  fullmeshCallUnsubscribe: any;
  roomPeerVideo = {};
  meshCallUnSubObserver: Subject<boolean>
  // Firebase Stuff
  roomRef: DocumentReference
  callerCandidatesCollection: CollectionReference
  calleeCandidatesCollection: AngularFirestoreCollection
  constructor(private afs: AngularFirestore, private userInfo: LoginService) {
    this.roomSetUpObserver = new Subject<boolean>();
    this.meshCallUnSubObserver = new Subject<boolean>();
    this.peerList = { "1234": "testing" }
    userInfo.auth.user.subscribe(
      (userCredentail) => {
        console.log(userCredentail.displayName)
        this.UserInfo = userCredentail;
      }
    )
    this.roomSetUpObserver.subscribe((vaule) => {
      console.log(`roomSetUpObserver Call when init`);
    })

  }

  unSubFullMeshCallBack() {
    this.meshCallUnSubObserver.subscribe((flag) => {
      if (flag == true) {
        this.fullmeshCallUnsubscribe();
      }
    })
  }

  async cleanRoom() {
    if (this.roomRef != undefined) {
      let data = await this.roomRef.get();
      if (this.UserInfo.email == data.get("host")) {
        await this.roomRef.delete();
      }
    }
  }

  async getRoomRef(path: string): Promise<boolean> {
    this.roomRef = this.afs.collection("rooms").doc(path).ref;
    let data = await this.roomRef.get();
    if (data.exists) {
      return true;
    } else {
      return false;
    }
  }
  async startPeerJS(myUUID?: string) {
    console.log(myUUID)
    if (myUUID == "2") {
      console.log("Call Camera")
      await this.invokegetUserMedia();
    }
    if (myUUID == "1") {
      await this.getDisplayMedia();
    }
    this.peer = new Peer(null, {
      debug: 3,
      // secure:true,
      // key:"helloworld",
      host: '192.168.1.12', port: 9000, path: '/myapp',
    });
    console.log(this.peer);
    // myUUID,
    // {
    //   host: '192.168.31.223', port: 9000, path: '/myapp',
    //   debug: 1, secure: false
    // }
    // );
    console.log(this.peer.id)
    this.peer.on("open", async (id) => {
      let data = await this.roomRef.get();
      if (data.exists) {
        if (data.data().candidates != null) {
          this.candidateList = data.get("candidates");
        } else {
          console.log("NOT FONUNDDDD");
          await this.roomRef.set({ "candidates": {} }, {
            merge: true
          })
        }
      }
      console.log(this.candidateList);
      this.candidateList[this.peer.id] = this.UserInfo.email
      await this.afs.collection("indexing").doc(this.peer.id).set({
        "roomRef": this.roomRef.path
      })
      await this.roomRef.update({ "candidates": this.candidateList });
      console.log(this.peer.id);
      this.fullMeshCalling(); // When to call this funtion ( after update or before)
      // After will notifi Other peer ( HIM call other - > other answear)
      // before will ( other peer call HIM - > HIM respone )
    })
    this.peer.on('connection', function (conn) {
      console.log(conn.type),
        conn.on('data', function (data) {
          console.log(data);
        });
    });
    this.onCall();
    this.roomSetUpObserver.next(true);
  }
  createCandidate(info: callerCandidates) {
    return info;
  }
  filterOutPeer(peerUUID: string) {
    // if (this.peerList[peerUUID].
    // ) {

    // }
    return
  }

  // this function for the want you just enter the room
  fullMeshCalling() {
    // Snap implentation               //
    this.fullmeshCallUnsubscribe = this.roomRef.onSnapshot((event) => {
      let freshData: {} = event.get("candidates");
      // let keys = Object.keys(this.candidateList);
      let freshKeys = Object.keys(freshData)
      if (freshKeys.length != 0) {
        freshKeys.forEach((key) => {
          if (this.candidateList[key] != undefined) {
            // Non update list
          } else {
            if (this.candidateList[key] != this.UserInfo.email) {
              console.log("Found my seft");
            }

            // Making mesh call to neweronce
            this.candidateList[key] = freshData[key];
            this.callPeerJs(key);

          }
        },
        )
        this.candidateList = freshData
        this.meshCallUnSubObserver.next(true);
      }
    }
    );

    // await one time
    // let roomData = (await this.roomRef.get());
    // let roomCandidate = roomData.get("candidates")
    // let keys = Object.keys(roomCandidate);
    // if (keys.length != 0) {
    //   keys.forEach((key)=>{
    //     if (key != this.peer.id) {
    //       this.callPeerJs(key);
    //     }
    //   })
    // }
  }

  onCall() {
    console.log("Sub to onCall()")
    this.peer.on('call', (call) => {
      this.peerList[call.peer] = this.createCandidate({ "connectionState": true }) // "connectionState": true mean Sending Media to that stream
      console.log(this.peerList);
      console.log(`OnCall() ${call.peer} is calling YOU`);
      if (this.myVideoMediaStream == null) {
        console.log(" NOT INIT CAMERA");
      }
      // Look up for room
      // Look up on Database ?
      // navigator.getUserMedia(this.videoConfig, (stream) => {
      call.answer(this.myVideoMediaStream); // Answer the call with an A/V stream.
      call.on('stream', (remoteStream) => {
        console.log("GOT REMOTE STREAM FROM CALLER");
        // Show stream in some <video> element.
        // this.otherVideoElement = new MediaStream(remoteStream);
        this.roomPeerVideo[call.peer] = new MediaStream(remoteStream);
      }
      )
    }
    );

  }

  toogleCamera() {
    this.myVideoMediaStream = new window.AudioContext().createMediaStreamDestination().stream;
  }

  notAgreeDevicesStream(): MediaStream {
    return new window.AudioContext().createMediaStreamDestination().stream;
  }

  async startCapture(displayMediaOptions) {
    let captureStream = null;

    try {
      // @ts-ignore
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }
  screenCapture: MediaStream

  async getDisplayMedia() {
    this.myVideoMediaStream = await this.startCapture({
      video: {
        cursor: "always"
      },
      audio: false
    });
  }
  async invokegetUserMedia() {
    try {
      // let displayApdater = navigator.mediaDevices as any;
      this.myVideoMediaStream = await navigator.mediaDevices.getUserMedia(this.videoConfig)
    } catch (error) { //MediaStreamError
      // Implement Get Media for disallow camera or Computer not found Devives
      if (error.name == "DevicesNotFoundError" || error.name == "NotFoundError") {
        console.log("Camera not found");
        // this.myVideoMediaStream = new MediaStream();
        this.myVideoMediaStream = this.notAgreeDevicesStream()
      } else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
        console.log("Do not allow");
        this.myVideoMediaStream = this.notAgreeDevicesStream();
      } else {
        console.log(error)
      }
    }
    // navigator.getUserMedia(this.videoConfig, (stream) => {
    //   this.myVideoMediaStream = new MediaStream(stream)
    //   console.log("give my webcame");
    // }, (err) => {
    //   // Implement Get Media for disallow camera or Computer not found Devives
    //   if (err.name == "DevicesNotFoundError" || err.name == "NotFoundError") {
    //     console.log("Camera not found");
    //     this.myVideoMediaStream = new MediaStream();
    //   } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
    //     console.log("Do not allow");
    //     this.myVideoMediaStream = new MediaStream();
    //   } else {
    //     console.log(err)
    //   }
    // })
  }

  async callPeerJs(peerUUID: string) {
    if (this.myVideoMediaStream != null) {
      this.callPeer(this.myVideoMediaStream, peerUUID);
    }
    // let room = this.streaming.roomRef.collection("")
    // navigator.getUserMedia(this.videoConfig, (stream) => {
    //   this.myVideoMediaStream = new MediaStream(stream)
    //   this.roomSetUpObserver.next(true);
    //   // console.log("give my webcame");
    // }, (err) => {
    //   // Implement Get Media for disallow camera or Computer not found Devives
    //   if (err.name == "DevicesNotFoundError" || err.name == "NotFoundError") {
    //     this.callPeer(this.myVideoMediaStream,peerUUID);
    //   } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
    //     this.callPeer(this.myVideoMediaStream,peerUUID);
    //   } else {
    //     console.log(err)
    //   }
    // })

  }

  callPeer(stream: MediaStream, peerUUID: string) { // Passing your stream to other
    console.log(" Call : " + peerUUID);
    let call = this.peer.call(peerUUID, stream, {
      // metadata:this.constraints
    });
    call.on('stream', (remoteStream) => {
      console.log("Got Remote Stream I CALL YOU");
      // this.otherVideoElement = new MediaStream(remoteStream);
      this.roomPeerVideo[call.peer] = new MediaStream(remoteStream);
    })

  }
  getUserMedia() {
    throw new Error("Method not implemented.");
  }
  createRoom() {
    throw new Error("Method not implemented.");
  }
  shortenRoomLink() {
    throw new Error("Method not implemented.");
  }
  registerPeerConnectionListeners() {
    throw new Error("Method not implemented.");
  }



  join() {
    throw new Error("Method not implemented.");
  }

  hangup() {
    // throw new Error("Method not implemented.");
  }
  getRoom() {
    // throw new Error("Method not implemented.");
  }
  roomStatus() {
    // throw new Error("Method not implemented.");
  }
  chatRoom() {
    // throw new Error("Method not implemented.");
  }
}

export interface StreamingServiceInterface {
  startPeerJS(myUUID: String);
  getRoom(); // check is it valid
  join();
  roomStatus(); // kick someonce ?? lock room
  chatRoom();
  createRoom();
  shortenRoomLink(); // check shotten Link
  hangup();
  registerPeerConnectionListeners();
  getUserMedia();

}
// List of user in a confrence room
class UserConfrnceVideo {
  userMedia: MediaStream[];

}

export class WebRTCRoomMode {
  mode: string
  id: string
  constructor(webMode: string) {
    this.mode = webMode;
  }

}