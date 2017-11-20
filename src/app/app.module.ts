import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MyFilesComponent} from './components/my-files/my-files.component';
import {AuthenticationComponent} from './components/authentication/authentication.component';
import {MyWalletComponent} from './components/my-wallet/my-wallet.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {SharedWithMeComponent} from './components/shared-with-me/shared-with-me.component';
import {RentStorageComponent} from './components/rent-storage/rent-storage.component';
import {ProvideStorageComponent} from './components/provide-storage/provide-storage.component';
import {RoutingModule} from './modules/routing/routing.module';
import {HttpClientModule} from '@angular/common/http';
import {NgxElectronModule} from 'ngx-electron';
import {MatButtonModule, MatCheckboxModule, MatListModule} from '@angular/material';

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
        RoutingModule,
        HttpClientModule,
        NgxElectronModule,
        MatButtonModule,
        MatListModule,
        MatCheckboxModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
