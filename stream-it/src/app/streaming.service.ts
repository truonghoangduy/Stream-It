import { Injectable } from '@angular/core';
// import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http'
import { AngularFirestore } from '@angular/fire/firestore/';
import { ThrowStmt } from '@angular/compiler';
import { LoginService } from './login.service';
import { async } from '@angular/core/testing';
@Injectable({
  providedIn: 'root'
})
export class StreamingService implements StreamingServiceInterface {

  peerConnection: RTCPeerConnection
  remoteStream: MediaStream
  localStream:MediaStream
  roomId: String
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
    // this.afs.collection
    this.peerConnection = new RTCPeerConnection(this.configuration);
    let roomRef = this.afs.firestore.collection('rooms').doc();

    // Asgin HOST
    // await roomRef.set({
    //   "host": this.userInfo.user
    // })
    this.registerPeerConnectionListeners();
    this.localStream = new MediaStream();
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Code for collecting ICE candidates below
    console.log("Are you work");
    const callerCandidatesCollection = roomRef.collection('callerCandidates');

    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    // Code for creating a room below
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('Created offer:', offer);

    const roomWithOffer = {
      'offer': {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await roomRef.set(roomWithOffer);
    this.roomId = await (await roomRef.get()).id
    console.log(`New room created with SDP offer. Room ID: ${this.roomId}`);

    
    // document.querySelector(
    //   '#currentRoom').innerHTML = `Current room is ${this.roomId} - You are the caller!`;
    // Code for creating a room above

    this.peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        this.remoteStream.addTrack(track);
      });
    });

    // Listening for remote session description below
    // roomRef.onSnapshot(async snapshot => {
    //   const data = snapshot.data();
    //   if (! this.peerConnection.currentRemoteDescription && data && data.answer) {
    //     console.log('Got remote description: ', data.answer);
    //     const rtcSessionDescription = new RTCSessionDescription(data.answer);
    //     await  this.peerConnection.setRemoteDescription(rtcSessionDescription);
    //   }
    // });
    roomRef.onSnapshot(async snapshot=>{
      let data:any = snapshot.data();
      if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
            console.log('Got remote description: ', data.answer);
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await this.peerConnection.setRemoteDescription(rtcSessionDescription);
          }
    }) 
    // .subscribe(async snapshot => {
    //   let data: any = snapshot.payload.data();
    //   if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
    //     console.log('Got remote description: ', data.answer);
    //     const rtcSessionDescription = new RTCSessionDescription(data.answer);
    //     await this.peerConnection.setRemoteDescription(rtcSessionDescription);
    //   }
    // })

    // Listening for remote session description above

    // Listen for remote ICE candidates below
    // roomRef.collection('calleeCandidates').snapshotChanges().subscribe(snapshot => {
    //   snapshot.forEach(async change => {
    //     if (change.type === 'added') {
    //       let data = change.payload.doc.data()
    //       console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
    //       await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
    //     }
    //   });
    // });

    roomRef.collection('calleeCandidates').onSnapshot(async snapshot=>{
      snapshot.docChanges().forEach(async change =>{
        if (change.type === "added") {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      })
    }
    ) 


    // Listen for remote ICE candidates above



    // throw new Error("Method not implemented.");
  }
  shortenRoomLink() {
    // throw new Error("Method not implemented.");
  }

  join() {
    // this.http.get()
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

}