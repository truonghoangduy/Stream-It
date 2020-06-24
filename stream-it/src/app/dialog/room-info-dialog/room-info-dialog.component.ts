import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogRoomData } from 'src/app/typepo/roomConfig';

@Component({
  selector: 'app-room-info-dialog',
  templateUrl: './room-info-dialog.component.html',
  styleUrls: ['./room-info-dialog.component.scss']
})
export class RoomInfoDialogComponent {
  componentTitle:String;
  constructor(
    public dialogRef: MatDialogRef<RoomInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogRoomData) 
    {
      if (data.title == "url") {
        this.componentTitle = "Please Paste The Room URL"
      }else{
        this.componentTitle = "Please Enter Your Room Name"
      }
    }

  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

}
