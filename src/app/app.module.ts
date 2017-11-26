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
import {MatCheckboxModule, MatListModule, MatTable, MatTableModule, MatDialogModule} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import {MatSliderModule} from '@angular/material/slider';
import {MatCardModule } from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import { FilebrowserComponent } from './filebrowser/filebrowser.component';
import { NewFolderDialogComponent } from './new-folder-dialog/new-folder-dialog.component';

@NgModule({
    entryComponents: [
        NewFolderDialogComponent
    ],
    declarations: [
        AppComponent,
        AuthenticationComponent,
        LoginComponent,
        MyFilesComponent,
        MyWalletComponent,
        ProvideStorageComponent,
        RegisterComponent,
        RentStorageComponent,
        SharedWithMeComponent,
        ProvideStorageComponent,
        FilebrowserComponent,
        NewFolderDialogComponent
    ],
    imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatInputModule,
        MatListModule,
        MatSliderModule,
        NgxElectronModule,
        RoutingModule,
        BrowserAnimationsModule,
        CdkTableModule,
        MatTableModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
