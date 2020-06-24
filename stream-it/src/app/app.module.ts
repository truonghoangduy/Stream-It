import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from "@angular/fire/auth";

import { environment } from '../environments/environment';

import { CheckInComponent } from './component/check-in/check-in.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { StreamComponent } from './component/stream/stream.component';
import {MatRippleModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import {MatSidenavModule} from '@angular/material/sidenav';
import { BackgroundThemeComponent } from './component/background-theme/background-theme.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatGridListModule} from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatDialogModule} from '@angular/material/dialog';
import { RoomDetailDialogComponent } from './dialog/room-detail-dialog/room-detail-dialog.component';
import { LoginComponent } from './component/login/login.component';
import { SignUpDialogComponent } from './dialog/room-detail-dialog/sign-up-dialog/sign-up-dialog.component';
// import { RoomDetailComponent } from './dialog/room-detail/room-detail.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import { RoomInfoDialogComponent } from './dialog/room-info-dialog/room-info-dialog.component';



@NgModule({
  declarations: [
    AppComponent,
    CheckInComponent,
    StreamComponent,
    BackgroundThemeComponent,
    RoomDetailDialogComponent,
    LoginComponent,
    SignUpDialogComponent,
    RoomInfoDialogComponent,
    // RoomDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatToolbarModule,
    DragDropModule,
    MatGridListModule,
    FlexLayoutModule,
    MatDialogModule,
    MatRadioModule,
    MatSelectModule,
    MatListModule
    
    // NgModule
  ],
  entryComponents:[RoomDetailDialogComponent,SignUpDialogComponent,RoomInfoDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
