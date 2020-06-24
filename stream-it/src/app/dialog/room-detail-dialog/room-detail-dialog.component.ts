import { Component, OnInit,Inject } from '@angular/core';
import {MatDialog,MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
  templateUrl: './room-detail-dialog.component.html',
  styleUrls: ['./room-detail-dialog.component.scss']
})
export class RoomDetailDialogComponent{

  message: string = ""
  cancelButtonText = "Cancel"
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<RoomDetailDialogComponent>) {
    if (data) {
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
    }
    this.dialogRef.updateSize('300vw','300vw')
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

}


// <div *ngIf="this.streaming.roomSetUpObserver |async">
// <!-- <video [srcObject]="this.streaming.myVionCalldeoElement"></video> -->
// <video #focusVideo autoplay="true" [srcObject]="this.streaming.myVideoMediaStream"
//     cdkDrag></video>
// <!-- <video [srcObject]="this.streaming.otherVideoElement" autoplay="true"></video> -->
// <div *ngIf="this.streaming.roomPeerVideo !=null">
//     <!-- <div>
//     <div class="grid-container grid-container--fill">
//         <div class="grid-element" *ngFor="let peer of this.streaming.candidateList; trackBy:peer.key |keyvalue">
//             <div>
//                 <video [id]="peer.key"></video>
//             </div>
//             <h1>hellloo working</h1>
//         </div>
//     </div>
// </div> -->
//     <div class="grid-container grid-container--fill">
//         <div *ngFor="let item of this.streaming.roomPeerVideo | keyvalue" class="grid-element">
//             <div>{{item.key}}</div>
//             <video [srcObject]="item.value" autoplay="true"></video>
//         </div>
//     </div>
// </div>
// </div>