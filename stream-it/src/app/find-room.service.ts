import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, CollectionReference, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FindRoomService {

  roomCollectionRef: AngularFirestoreCollection
  listOfRoom: any[]
  listOfFilteredRoom: any[]
  constructor(private afs: AngularFirestore) {
    this.roomCollectionRef = this.afs.collection("rooms")
  }


  getFiltteredRoom(filterType: String, keyCode: String) {
    console.log(`Call ${filterType} : ${keyCode}`)
    switch (filterType) {
      case 'email':
        this.listOfFilteredRoom = this.listOfRoom.filter((vaule) => vaule.host.includes(keyCode))
        break;
      case 'name':
        this.listOfFilteredRoom = this.listOfRoom.filter((vaule) => vaule.roomName.includes(keyCode))
        break;
      case 'allpast':
        this.listOfFilteredRoom = this.listOfRoom.filter((vaule) => vaule.roomConfig == false)
        break
      case 'lock':
        this.listOfFilteredRoom = this.listOfRoom.filter((vaule) => vaule.roomConfig == true)
        break
      case 'roomName':
        this.listOfFilteredRoom = this.listOfRoom.filter((vaule) => vaule.roomName.includes(keyCode))
        break
    }

    console.log(this.listOfFilteredRoom);
  }
  getAllRoom() {
    this.roomCollectionRef.snapshotChanges().subscribe(
      (rooms) => {
        let temperData = [];
        rooms.forEach((room) => {
          let data = room.payload.doc.data()
          temperData.push(data)
        })
        this.listOfRoom = temperData;
      }
    )
  }


}
