import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminportalComponent } from './adminportal/adminportal.component';
import { HomeComponent } from './home/home.component';
import { LogincardComponent } from './logincard/logincard.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', component: MainpageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'adminportal', component: AdminportalComponent },

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
