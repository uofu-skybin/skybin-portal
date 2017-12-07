import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MyFilesComponent } from './components/my-files/my-files.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { MyWalletComponent } from './components/my-wallet/my-wallet.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SharedWithMeComponent } from './components/shared-with-me/shared-with-me.component';
import { RentStorageComponent } from './components/rent-storage/rent-storage.component';
import { ProvideStorageComponent } from './components/provide-storage/provide-storage.component';
import { RoutingModule } from './modules/routing/routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NgxElectronModule } from 'ngx-electron';
import {
    MatCheckboxModule,
    MatDialogModule,
    MatListModule,
    MatMenuModule,
    MatOptionModule,
    MatProgressBarModule,
    MatSelectModule, MatSortModule,
    MatTableModule,
    MatTabsModule,
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { FilebrowserComponent } from './components/filebrowser/filebrowser.component';
import { NewFolderDialogComponent } from './components/new-folder-dialog/new-folder-dialog.component';
import { ShareDialogComponent } from './components/share-dialog/share-dialog.component';
import { BytesPipe } from './pipes/bytes.pipe';
import { ViewFileDetailsComponent } from './components/view-file-details/view-file-details.component';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
    entryComponents: [
        NewFolderDialogComponent,
        ShareDialogComponent,
        ViewFileDetailsComponent
    ],
    declarations: [
        AppComponent,
        AuthenticationComponent,
        BytesPipe,
        FilebrowserComponent,
        LoginComponent,
        MyFilesComponent,
        MyWalletComponent,
        NewFolderDialogComponent,
        ProvideStorageComponent,
        ProvideStorageComponent,
        RegisterComponent,
        RentStorageComponent,
        ShareDialogComponent,
        SharedWithMeComponent,
        TruncatePipe,
        ViewFileDetailsComponent,
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserAnimationsModule,
        BrowserModule,
        CdkTableModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatOptionModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSliderModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        NgxElectronModule,
        RoutingModule,
    ],
    providers: [TruncatePipe],
    bootstrap: [AppComponent]
})
export class AppModule {
}
