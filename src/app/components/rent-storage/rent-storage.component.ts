import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http/src/response';

@Component({
  selector: 'app-rent-storage',
  templateUrl: './rent-storage.component.html',
  styleUrls: ['./rent-storage.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RentStorageComponent implements OnInit {

  // Renter info object returned from the renter service.
  private renterInfo: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.updateRenterInfo();
  }

  reserveClicked(amount) {
    const params = {
      amount: parseInt(amount),
    };
    this.http.post('http://localhost:8002/storage', params)
      .subscribe((resp: any) => {
        this.updateRenterInfo();
      }, (error: HttpErrorResponse) => {
        console.error(error);
      });
  }

  updateRenterInfo() {
    this.http.get('http://localhost:8002/info')
      .subscribe((resp: any) => {
        this.renterInfo = resp;
      }, (error: HttpErrorResponse) => {
        console.error(error);
      });
  }

}
