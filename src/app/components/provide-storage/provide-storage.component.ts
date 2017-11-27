import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http/src/response';


interface Contract {
  storageSpace: string;
  renterID: string;
}

interface ContractsResponse {
  contracts: Contract[];
}

@Component({
  selector: 'app-provide-storage',
  templateUrl: './provide-storage.component.html',
  styleUrls: ['./provide-storage.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ProvideStorageComponent implements OnInit {
      myContracts: Contract[] = [];

        private dataSource = null;

      constructor(private http: HttpClient) { }

      ngOnInit() {
        this.loadContracts();
        this.dataSource = new MatTableDataSource(this.myContracts);
      }

      private loadContracts() {
        this.http.get<ContractsResponse>('http://127.0.0.1:8003/contracts').subscribe(response => {
            console.log(response);
            if (response.contracts) {
                response.contracts.forEach(contract => {
                    this.myContracts.push(contract);
                });
            }
        });
    }
    updateProviderSettings() {
        // TODO: get some stuff here
    }

}
