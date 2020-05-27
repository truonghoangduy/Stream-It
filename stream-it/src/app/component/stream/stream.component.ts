import { Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { StreamingService } from 'src/app/streaming.service';
import { ActivatedRoute } from "@angular/router";

@Component({
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit,AfterViewInit,OnDestroy {
  videoConfig = {video: true, audio: false};
  // @Input() 
  roomURL:String;
  myColor:String;
  value:String;

  @ViewChild('focusVideo',{ static: true}) focusedVideoElement:ElementRef;
  constructor(public streaming:StreamingService,private route:ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
    // http://localhost:4200/room/12345678 
      let id = params.get("id")
      if (id != "" && id !=null) {
        this.streaming.joinRoom(id)
      }
    })
    
  }
  
  
  ngAfterViewInit(): void {
    // throw new Error("Method not implemented.");
  }

  ngOnInit(): void {
    // this.streaming.roomSetUpObserver.subscribe(event=>{
    //   if (event) {
    //     console.log(".....[].....")
    //   }
    // })
    // console.log(this.focusedVideoElement)
  }
  ngOnDestroy():void{
  }
  
  checkURL(){

  }

  closeRoomID(){
    console.log("Closeed");
  }

  asyncjoinRoom(id:string){
    // console.log(id)
    this.streaming.joinRoom(id);
  }
  stopUserMedia(){
    this.focusedVideoElement.nativeElement.pause();

  }

  async createRoom(){
     await this.streaming.createRoom();
  }

  async getUserMedia(){
    navigator.getUserMedia(this.videoConfig,(stream)=>{
      // Hmm why use HTMLVideoElement not working Hmmm
      this.focusedVideoElement.nativeElement.srcObject = stream;
      this.streaming.localStream= stream;

      // this.streaming.localStream.getTracks().forEach(track=>{
      //   this.streaming.peerConnection.addTrack(track,this.streaming.localStream)
      // })
      // stream.getTracks().forEach(track=>{
      //   this.streaming.peerConnection.addTrack(track,stream)
      // })
      // Video Tag Auto play
    },(err)=>{
      console.log(err)
    })
  }
}