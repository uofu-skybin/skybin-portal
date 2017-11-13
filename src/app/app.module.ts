import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { MyFilesComponent } from './my-files/my-files.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';


@NgModule({
  declarations: [
    AppComponent,
    MyFilesComponent,
    AuthenticationComponent,
    MyWalletComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
