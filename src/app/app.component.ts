import {Component, NgZone, OnInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private electronService: ElectronService,
                private router: Router,
                private route: ActivatedRoute,
                private zone: NgZone) {
    }

    currentPage = 'My Files';

    ngOnInit(): void {
        this.router.navigate(['my-files']);
    }

    myFilesClicked(e) {
        this.router.navigate(['my-files']);
        this.currentPage = 'My Files';
    }

    sharedWithMeClicked(e) {
        this.router.navigate(['shared-with-me']);
        this.currentPage = 'Shared With Me';
    }

    provideStorageClicked(e) {
        this.router.navigate(['provide-storage']);
        this.currentPage = 'Provide Storage';
    }

}
