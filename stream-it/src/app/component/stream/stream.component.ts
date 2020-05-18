import { Component, OnInit, Input } from '@angular/core';
import { StreamingService } from 'src/app/streaming.service';

@Component({
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  // @Input() 
  roomURL:String;
  myColor:String;

  constructor(private streaming:StreamingService) {
    this.myColor="red"
   }

  ngOnInit(): void {
  }
  
  checkURL(){

  }

  createRoom(){
    this.streaming.createRoom();
  }

}