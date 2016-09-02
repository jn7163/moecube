import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MyCardComponent }  from './mycard.component';
import { LoginComponent } from './login.component';
import { StoreComponent } from './store.component';
import { LobbyComponent } from './lobby.component';
import { CommunityComponent } from './community.component';


@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MyCardComponent, LoginComponent, StoreComponent, LobbyComponent, CommunityComponent ],
  bootstrap:    [ MyCardComponent ]
})
export class MyCard { }