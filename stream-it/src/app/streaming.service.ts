import { Injectable } from '@angular/core';
// import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http'
import { AngularFirestore, DocumentReference, CollectionReference, AngularFirestoreCollection } from '@angular/fire/firestore/';
import { ThrowStmt } from '@angular/compiler';
import { LoginService } from './login.service';
import { async } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import * as adapter from 'webrtc-adapter'

const ICE_SERVERS: RTCIceServer[] = [
  {urls: ['stun:stun.example.com', 'stun:stun-1.example.com']},
  {urls: 'stun:stun.l.google.com:19302'}
];

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 10,

};
@Injectable({
  providedIn: 'root'
})
export class StreamingService implements StreamingServiceInterface {

  peerConnection: RTCPeerConnection
  remoteStream: MediaStream
  localStream:MediaStream
  roomId: String
  otherUserMedia:MediaStream[];
  roomSetUpObserver:Subject<boolean>
  sendChannel: RTCDataChannel;

  // Firebase Stuff
  roomRef:DocumentReference
  callerCandidatesCollection:CollectionReference
  calleeCandidatesCollection:AngularFirestoreCollection
  

  configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  
  

  constructor(private afs: AngularFirestore, private userInfo: LoginService) {
    this.localStream = new MediaStream();
    this.roomSetUpObserver = new Subject<boolean>();
  }

  join() {
    throw new Error("Method not implemented.");
  }
  async  getUserMedia() :Promise<MediaStream>{
    return await navigator.mediaDevices.getUserMedia({video: true, audio: true});
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
  async createRoom() {
    this.roomRef = this.afs.firestore.collection('rooms').doc();
    this.callerCandidatesCollection = this.roomRef.collection('callerCandidates');
    this.startsever()
    let rtcOfferConfig = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    }
     let offer = await this.peerConnection.createOffer(rtcOfferConfig);
     await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));
     const roomWithOffer = {
      'offer': {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await this.roomRef.set(roomWithOffer);

    // this.peerConnection.createOffer().then(offer=>{
    //   this.setDescription(offer)
    // })

    this.localStream.getTracks().forEach(track => {
      console.log("OK Get Local Track")
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.roomId = (await this.roomRef.get()).id
    console.log(`New room created with SDP offer. Room ID: ${this.roomId}`);

    this.peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        this.remoteStream.addTrack(track);
      });
    });

    // Listening for remote session description below
    this.roomRef.onSnapshot(async snapshot=>{
      let data:any = snapshot.data();
      console.log("HAS Listen roomRef Snap")
      console.log(data)
      if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
            console.log('Got remote description: ', data.answer);
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await this.peerConnection.setRemoteDescription(rtcSessionDescription);
          }
    }) 
    
  }
  
  send() {
    this.sendChannel.send('hi');
  }
  


  startsever(mode?:WebRTCRoomMode){
    this.peerConnection = new RTCPeerConnection(PEER_CONNECTION_CONFIG)
    this.peerConnection.onicecandidate = this.getIceCandidateCallback(mode    
    );
      // this.peerConnection.ondatachannel = (event) => { console.log(`received message from channel`); };
      // this.sendChannel = this.peerConnection.createDataChannel('sendDataChannel');
    }
  
  getIceCandidateCallback(mode?:WebRTCRoomMode){
    return (event:RTCPeerConnectionIceEvent) => {
      console.log(`got ice candidate:`);
      console.log(event);

      if (event.candidate != null) {
        console.log("HAS ICE")
        console.log(event.candidate)
        if (mode?.mode == "peer") {
          this.calleeCandidatesCollection.add(event.candidate.toJSON())
        }else{
          this.callerCandidatesCollection.add(event.candidate.toJSON())
        }
      }
    };
  }

   getOtherMediaStreamCallBack(){
     return (MediaCallBack:RTCTrackEvent)=>{
       console.log("Has Other Media");
      this.otherUserMedia.push.apply(MediaCallBack.streams)
     }
   }
   



















  
  shortenRoomLink() {
    // throw new Error("Method not implemented.");
  }
  async joinRoom(id:string) {
    const roomRef = this.afs.collection("rooms").doc(id);
    let roomID = await roomRef.get().toPromise();
    console.log(`Finding Room ${id}`)
    if (roomID.exists) {
      console.log("HAS ROOM");
       this.calleeCandidatesCollection = roomRef.collection('calleeCandidates');

      this.startsever(new WebRTCRoomMode("peer"));
      // this.peerConnection = new RTCPeerConnection(this.configuration);
      // this.registerPeerConnectionListeners();

      // Add Camera video to RTC
      this.localStream.getTracks().forEach(track=>{
        this.peerConnection.addTrack(track,this.localStream)
      })

      // Listen other MediaStream || 19/5 only do for 1 user (streams[0])
      // this.peerConnection.addEventListener('track', event => {
      //   console.log('Got remote track:', event.streams[0]);
      //   event.streams[0].getTracks().forEach(track => {
      //     console.log('Add a track to the remoteStream:', track);
      //     this.remoteStream.addTrack(track);
      //   });
      // });
      // this.peerConnection.addEventListener('track', async (event) => {
      //   console.log(`Has ${event.streams.length} aveable stream`);
      //   this.otherUserMedia.push.apply(event.streams)
      // });
      this.peerConnection.ontrack = this.getOtherMediaStreamCallBack()

    // Code for creating SDP answer below
    const offer = roomID.data().offer;
    console.log('Got offer:', offer);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    console.log('Created answer:', answer);
    await this.peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await roomRef.update(roomWithAnswer);
    // Code for creating SDP answer above

    // Listening for remote ICE candidates below
    //Firebase issuse ?
    roomRef.collection('callerCandidates').valueChanges(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    this.roomSetUpObserver.next(true)
    // Listening for remote ICE candidates above
  }



    
  }

  registerPeerConnectionListeners() {
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`Connection state change: ${this.peerConnection.connectionState}`);
    });

    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
        `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
    });
    // throw new Error("Method not implemented.");
  }



  // Test funciton parrameter and return
}

export interface StreamingServiceInterface {
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
  userMedia:MediaStream[];
  
}

export class WebRTCRoomMode{
  mode:string
  id:string
  constructor(webMode: string){
    this.mode=webMode;
  }

}
// Callee find a room
// Step 1 hold a ref to document roomID ( and make snapshot bla bla bla)

// Callee Send up the Answear then Caller setup the RemoteICE