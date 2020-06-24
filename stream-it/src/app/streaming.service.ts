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
    this.roomSetUpObserver.subscribe((vaule)=>{
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

   async getRoomRef(path: string):Promise<boolean> {
    this.roomRef = this.afs.collection("rooms").doc(path).ref;
    let data = await this.roomRef.get();
    if (data.exists) {
      return true;
    }else{
      return false;
    }
  }
  async startPeerJS(myUUID: string) {
    await this.invokegetUserMedia();
    this.peer = new Peer(null, {
      debug: 2,
      // secure:true,
      // host: '10.104.3.199', port: 9000, path: '/peerjs',
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

  notAgreeDevicesStream():MediaStream{
    return new window.AudioContext().createMediaStreamDestination().stream;
  }

  async invokegetUserMedia() {
    try {
      this.myVideoMediaStream = await navigator.mediaDevices.getUserMedia(this.videoConfig)
    } catch (error) { //MediaStreamError
      // Implement Get Media for disallow camera or Computer not found Devives
      if (error.name == "DevicesNotFoundError" || error.name == "NotFoundError") {
        console.log("Camera not found");
        // this.myVideoMediaStream = new MediaStream();
        this.myVideoMediaStream = this.notAgreeDevicesStream()
      } else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
        console.log("Do not allow");
        this.myVideoMediaStream =this.notAgreeDevicesStream();
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
    let call = this.peer.call(peerUUID, stream);
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

// Callee find a room
// Step 1 hold a ref to document roomID ( and make snapshot bla bla bla)

// Callee Send up the Answear then Caller setup the RemoteICE


// OlD WebRTC Implemation working with ICE is hard to debug 27/5/2020 - > move to PeerJS WebRTC wrapper API
// async createRoom() {
//   this.roomRef = this.afs.firestore.collection('rooms').doc();

//   this.callerCandidatesCollection = this.roomRef.collection('participants');

//   // this.startsever()

//    let offer = await this.peerConnection.createOffer(rtcOfferConfig);
//    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));
//    const roomWithOffer = {
//     'offer': {
//       type: offer.type,
//       sdp: offer.sdp,
//     },
//   };
//   await this.roomRef.set(roomWithOffer);

  // this.peerConnection.createOffer().then(offer=>{
  //   this.setDescription(offer)
  // })

//   this.localStream.getTracks().forEach(track => {
//     console.log("OK Get Local Track")
//     this.peerConnection.addTrack(track, this.localStream);
//   });

//   this.roomId = (await this.roomRef.get()).id
//   console.log(`New room created with SDP offer. Room ID: ${this.roomId}`);

//   this.peerConnection.addEventListener('track', event => {
//     console.log('Got remote track:', event.streams[0]);
//     event.streams[0].getTracks().forEach(track => {
//       console.log('Add a track to the remoteStream:', track);
//       this.remoteStream.addTrack(track);
//     });
//   });

//   // Listening for remote session description below
//   this.roomRef.onSnapshot(async snapshot=>{
//     let data:any = snapshot.data();
//     console.log("HAS Listen roomRef Snap")
//     console.log(data)
//     if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
//           console.log('Got remote description: ', data.answer);
//           const rtcSessionDescription = new RTCSessionDescription(data.answer);
//           await this.peerConnection.setRemoteDescription(rtcSessionDescription);
//         }
//   }) 

// }

// send() {
//   this.sendChannel.send('hi');
// }



// startsever(mode?:WebRTCRoomMode){
//   this.peerConnection = new RTCPeerConnection(PEER_CONNECTION_CONFIG)
//   this.peerConnection.onicecandidate = this.getIceCandidateCallback(mode    
//   );
//     // this.peerConnection.ondatachannel = (event) => { console.log(`received message from channel`); };
//     // this.sendChannel = this.peerConnection.createDataChannel('sendDataChannel');
//   }

// getIceCandidateCallback(mode?:WebRTCRoomMode){
//   return (event:RTCPeerConnectionIceEvent) => {
//     console.log(`got ice candidate:`);
//     console.log(event);

//     if (event.candidate != null) {
//       console.log("HAS ICE")
//       console.log(event.candidate)
//       if (mode?.mode == "peer") {
//         this.calleeCandidatesCollection.add(event.candidate.toJSON())
//       }else{
//         this.callerCandidatesCollection.add(event.candidate.toJSON())
//       }
//     }
//   };
// }

//  getOtherMediaStreamCallBack(){
//    return (MediaCallBack:RTCTrackEvent)=>{
//      console.log("Has Other Media");
//     this.otherUserMedia.push.apply(MediaCallBack.streams)
//    }
//  }





















// shortenRoomLink() {
//   // throw new Error("Method not implemented.");
// }
// async joinRoom(id:string) {
//   const roomRef = this.afs.collection("rooms").doc(id);
//   let roomID = await roomRef.get().toPromise();
//   console.log(`Finding Room ${id}`)
//   if (roomID.exists) {
//     console.log("HAS ROOM");
//      this.calleeCandidatesCollection = roomRef.collection('calleeCandidates');

//     this.startsever(new WebRTCRoomMode("peer"));
//     // this.peerConnection = new RTCPeerConnection(this.configuration);
//     // this.registerPeerConnectionListeners();

//     // Add Camera video to RTC
//     this.localStream.getTracks().forEach(track=>{
//       this.peerConnection.addTrack(track,this.localStream)
//     })

//     // Listen other MediaStream || 19/5 only do for 1 user (streams[0])
//     // this.peerConnection.addEventListener('track', event => {
//     //   console.log('Got remote track:', event.streams[0]);
//     //   event.streams[0].getTracks().forEach(track => {
//     //     console.log('Add a track to the remoteStream:', track);
//     //     this.remoteStream.addTrack(track);
//     //   });
//     // });
//     // this.peerConnection.addEventListener('track', async (event) => {
//     //   console.log(`Has ${event.streams.length} aveable stream`);
//     //   this.otherUserMedia.push.apply(event.streams)
//     // });
//     this.peerConnection.ontrack = this.getOtherMediaStreamCallBack()

//   // Code for creating SDP answer below
//   const offer = roomID.data().offer;
//   console.log('Got offer:', offer);
//   await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//   const answer = await this.peerConnection.createAnswer();
//   console.log('Created answer:', answer);
//   await this.peerConnection.setLocalDescription(answer);

//   const roomWithAnswer = {
//     answer: {
//       type: answer.type,
//       sdp: answer.sdp,
//     },
//   };
//   await roomRef.update(roomWithAnswer);
//   // Code for creating SDP answer above

//   // Listening for remote ICE candidates below
//   //Firebase issuse ?
//   roomRef.collection('callerCandidates').valueChanges(snapshot => {
//     snapshot.docChanges().forEach(async change => {
//       if (change.type === 'added') {
//         let data = change.doc.data();
//         console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
//         await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
//       }
//     });
//   });
//   this.roomSetUpObserver.next(true)
//   // Listening for remote ICE candidates above
// }




// }

// registerPeerConnectionListeners() {
//   this.peerConnection.addEventListener('icegatheringstatechange', () => {
//     console.log(
//       `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
//   });

//   this.peerConnection.addEventListener('connectionstatechange', () => {
//     console.log(`Connection state change: ${this.peerConnection.connectionState}`);
//   });

//   this.peerConnection.addEventListener('signalingstatechange', () => {
//     console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
//   });

//   this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
//     console.log(
//       `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
//   });
//   // throw new Error("Method not implemented.");
// }



// // Test funciton parrameter and return
// }