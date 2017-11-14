import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegisterComponent} from '../register/register.component';
import {LoginComponent} from '../login/login.component';
import {MyFilesComponent} from '../my-files/my-files.component';
import {SharedWithMeComponent} from '../shared-with-me/shared-with-me.component';
import {RentStorageComponent} from '../rent-storage/rent-storage.component';
import {ProvideStorageComponent} from '../provide-storage/provide-storage.component';
import {MyWalletComponent} from '../my-wallet/my-wallet.component';


const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'login', pathMatch: 'full', component: LoginComponent },
  { path: 'register', pathMatch: 'full', component: RegisterComponent },
  { path: 'my-files', pathMatch: 'full', component: MyFilesComponent },
  { path: 'shared-with-me', pathMatch: 'full', component: SharedWithMeComponent },
  { path: 'rent-storage', pathMatch: 'full', component: RentStorageComponent},
  { path: 'provide-storage', pathMatch: 'full', component: ProvideStorageComponent},
  { path: 'my-wallet', pathMatch: 'full', component: MyWalletComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class RoutingModule { }
