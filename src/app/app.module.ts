import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { MyFilesComponent } from './my-files/my-files.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {RoutingModule} from './routing/routing.module';
import { SharedWithMeComponent } from './shared-with-me/shared-with-me.component';
import { RentStorageComponent } from './rent-storage/rent-storage.component';
import { ProvideStorageComponent } from './provide-storage/provide-storage.component';

@NgModule({
  declarations: [
    AppComponent,
    MyFilesComponent,
    AuthenticationComponent,
    MyWalletComponent,
    LoginComponent,
    RegisterComponent,
    SharedWithMeComponent,
    RentStorageComponent,
    ProvideStorageComponent
  ],
  imports: [
    BrowserModule,
    RoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
