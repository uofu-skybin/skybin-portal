import {Component, OnInit, ViewEncapsulation} from '@angular/core';

const { shell } = electron;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
        // shell.openExternal('https://github.com');
    }

}
