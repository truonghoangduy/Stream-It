import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamComponent } from './component/stream/stream.component';


const routes: Routes = [
  {
    path:"room",
    component:StreamComponent
  },
  {
    path:"room/:id",
    component:StreamComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
