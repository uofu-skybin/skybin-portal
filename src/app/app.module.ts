import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MyFilesComponent } from './components/my-files/my-files.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { MyWalletComponent } from './components/my-wallet/my-wallet.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SharedWithMeComponent } from './components/shared-with-me/shared-with-me.component';
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
    MatSnackBarModule,
    MatSnackBar,
    MatProgressSpinnerModule,
    MatTooltipModule
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { FilebrowserComponent } from './components/filebrowser/filebrowser.component';
import { NewFolderDialogComponent } from './components/dialogs/new-folder-dialog/new-folder-dialog.component';
import { ShareDialogComponent } from './components/share-dialog/share-dialog.component';
import { BytesPipe } from './pipes/bytes.pipe';
import { ViewFileDetailsComponent } from './components/view-file-details/view-file-details.component';
import { TruncatePipe } from './pipes/truncate/truncate.pipe';
import { AddStorageComponent } from './components/dialogs/add-storage/add-storage.component';
import { ConfigureStorageComponent } from './components/dialogs/configure-storage/configure-storage.component';
import { NotificationComponent } from './components/notification/notification.component';
import { RenterService } from './services/renter.service';
import { ToHtmlPipe } from './pipes/to-html/to-html.pipe';
import { ReserveStorageProgressComponent } from './components/dialogs/reserve-storage-progress/reserve-storage-progress.component';
import {NgDragDropModule} from 'ng-drag-drop';

@NgModule({
    entryComponents: [
        AddStorageComponent,
        ConfigureStorageComponent,
        NewFolderDialogComponent,
        NotificationComponent,
        ReserveStorageProgressComponent,
        ShareDialogComponent,
        ViewFileDetailsComponent,
    ],
    declarations: [
        AddStorageComponent,
        AppComponent,
        AuthenticationComponent,
        BytesPipe,
        ConfigureStorageComponent,
        FilebrowserComponent,
        LoginComponent,
        MyFilesComponent,
        MyWalletComponent,
        NewFolderDialogComponent,
        NotificationComponent,
        ProvideStorageComponent,
        ProvideStorageComponent,
        RegisterComponent,
        ReserveStorageProgressComponent,
        ShareDialogComponent,
        SharedWithMeComponent,
        ToHtmlPipe,
        TruncatePipe,
        ViewFileDetailsComponent,
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserAnimationsModule,
        NgDragDropModule.forRoot(),
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
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSliderModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        NgxElectronModule,
        RoutingModule,
    ],
    providers: [
        RenterService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
