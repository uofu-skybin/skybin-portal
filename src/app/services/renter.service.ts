import {Injectable, NgZone} from '@angular/core';
import {GetFilesResponse, RenterInfo, SkyFile} from '../models/common';
import {appConfig} from '../models/config';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {MatSnackBar} from '@angular/material';
import {NotificationComponent} from '../components/notification/notification.component';

@Injectable()
export class RenterService {
    constructor(private http: HttpClient,
                public snackBar: MatSnackBar,
                private zone: NgZone) {
    }

    getFiles(): Observable<GetFilesResponse> {
        return this.http.get<GetFilesResponse>(`${appConfig['renterAddress']}/files`)
            .pipe(
                catchError(this.handleError('getFiles', {files: []}))
            );
    }

    getRenterInfo(): Observable<RenterInfo> {
        return this.http.get<RenterInfo>(`${appConfig['renterAddress']}/info`)
            .pipe(
                catchError(this.handleError('getRenterInfo', new RenterInfo()))
            );
    }

    uploadFile(sourcePath: string, body: any): Observable<SkyFile> {
        return this.http.post<SkyFile>(`${appConfig['renterAddress']}/files/upload`, body)
            .pipe(
                catchError(this.handleError('uploadFile', new SkyFile()))
            );
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.log(`${operation} failed: ${error.message}`);

            this.zone.run(() => {
                this.snackBar.openFromComponent(NotificationComponent, {
                    data: error.message,
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                });
            });

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}