import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamComponent } from './component/stream/stream.component';
import { CheckInComponent } from './component/check-in/check-in.component';
import { LoginComponent } from './component/login/login.component';


const routes: Routes = [
  {
    path:"room",
    component:StreamComponent
  },
  {
    path:"room/:id",
    component:StreamComponent
  },
  {
    path:"",
    component:LoginComponent
  },
  {
    path:"checkin",
    component:CheckInComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
