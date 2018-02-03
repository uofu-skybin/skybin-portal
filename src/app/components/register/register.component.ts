import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() {
        // TODO: Add UI for indicating to the user that their identity was
        // not found and will be generated automatically.
        this.router.navigate(['/my-files']);
    }

}
