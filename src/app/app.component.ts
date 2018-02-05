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

    ngOnInit(): void {
        this.router.navigate(['my-files']);
    }

    onDrop(e) {
        e.preventDefault();
    }

    onDragOver(e) {
        e.preventDefault();
    }
}
