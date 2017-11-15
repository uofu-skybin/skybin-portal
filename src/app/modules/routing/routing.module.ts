import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../../components/login/login.component';
import {RegisterComponent} from '../../components/register/register.component';
import {MyFilesComponent} from '../../components/my-files/my-files.component';
import {SharedWithMeComponent} from '../../components/shared-with-me/shared-with-me.component';
import {RentStorageComponent} from '../../components/rent-storage/rent-storage.component';
import {ProvideStorageComponent} from '../../components/provide-storage/provide-storage.component';
import {MyWalletComponent} from '../../components/my-wallet/my-wallet.component';

const routes: Routes = [
  { path: '', redirectTo: 'my-files', pathMatch: 'full' },
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
