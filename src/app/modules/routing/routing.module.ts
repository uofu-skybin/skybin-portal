import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MyFilesComponent} from '../../components/my-files/my-files.component';
import {SharedWithMeComponent} from '../../components/shared-with-me/shared-with-me.component';
import {ProvideStorageComponent} from '../../components/provide-storage/provide-storage.component';
import {MyWalletComponent} from '../../components/my-wallet/my-wallet.component';

const routes: Routes = [
    // { path: '', redirectTo: 'login', pathMatch: 'full' },
    {path: '', redirectTo: 'my-files', pathMatch: 'full'},
    {
        path: 'my-files',
        pathMatch: 'full',
        component: MyFilesComponent,
        data: {
            shared: false
        }
    },
    // { path: 'shared-with-me', pathMatch: 'full', component: SharedWithMeComponent },
    {
        path: 'shared-with-me',
        pathMatch: 'full',
        component: MyFilesComponent,
        data: {
            shared: true
        }},
    {path: 'provide-storage', pathMatch: 'full', component: ProvideStorageComponent},
    {path: 'my-wallet', pathMatch: 'full', component: MyWalletComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {initialNavigation: false})],
    exports: [RouterModule]
})

export class RoutingModule {
}
