import {Injectable, NgZone} from '@angular/core';
import {GetFilesResponse, ContractsResponse, RenterInfo, SkyFile, ShareResponse, DownloadResponse, TransactionsResponse} from '../models/common';
import {appConfig} from '../models/config';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {MatSnackBar} from '@angular/material';
import {NotificationComponent} from '../components/notification/notification.component';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class RenterService {
    private emitStorageChangeSource = new Subject<any>();
    storageChangeEmitted$ = this.emitStorageChangeSource.asObservable();

    emitStorageChange(change: number) {
        this.emitStorageChangeSource.next(change);
    }

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

    getSharedFiles(): Observable<GetFilesResponse> {
        return this.http.get<GetFilesResponse>(`${appConfig['renterAddress']}/files/shared`)
            .pipe(
                catchError(this.handleError('getSharedFiles', {files: []}))
            );
    }

    renameFile(fileId: string, name: string): Observable<SkyFile> {
        const body = {
            fileId: fileId,
            name: name
        };
        return this.http.post<SkyFile>(`${appConfig['renterAddress']}/files/rename`, body)
            .pipe(
                catchError(this.handleError('renameFile', new SkyFile()))
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

    reserveStorage(amount: number) {
        const data = {
            amount: amount
        };
        return this.http.post<ContractsResponse>(`${appConfig['renterAddress']}/reserve-storage`, data)
            .pipe(
                catchError(this.handleError('reserveStorage', new ContractsResponse()))
            );
    }

    downloadFile(id: string, destPath: string, versionNum?: number) {
        const url = `${appConfig['renterAddress']}/files/download`;
        let body;
        if (versionNum !== null) {
            body = {
                fileId: id,
                destPath: destPath,
                versionNum: versionNum
            };
        } else {
            body = {
                fileId: id,
                destPath: destPath
            };
        }
        return this.http.post<DownloadResponse>(url, body)
            .pipe(
                catchError(this.handleError('downloadFile', new DownloadResponse()))
            );
    }

    createFolder(folderPath: string) {
        return this.http.post(`${appConfig['renterAddress']}/files/create-folder`, {name: folderPath})
            .pipe(
                catchError(this.handleError('createFolder', new SkyFile()))
            );
    }

    deleteFile(fileId: string, versionNum?: number, recursive = false) {
        let body;
        if (versionNum != null) {
            body = {
                fileId: fileId,
                versionNum: versionNum,
            };
        } else {
            body = {
                fileId: fileId,
                recursive: recursive
            };
        }
        return this.http.post(`${appConfig['renterAddress']}/files/remove`, body)
            .pipe(
                catchError(this.handleError('deleteFile', new SkyFile()))
            );
    }

    removeSharedFile(fileId: string) {
        const body = {
            fileId
        };
        return this.http.post(`${appConfig['renterAddress']}/files/shared/remove`, body)
            .pipe(
                catchError(this.handleError('deleteSharedFile', new SkyFile()))
            );
    }

    shareFile(fileId: string, renterAlias: string) {
        return this.http.post<ShareResponse>(`${appConfig['renterAddress']}/files/share`, {fileId: fileId, renterAlias: renterAlias})
            .pipe(
                catchError(this.handleError('shareFile', new ShareResponse()))
            );
    }

    withdraw(email: string, amount: number) {
        return this.http.post(`${appConfig['renterAddress']}/paypal/withdraw`, {email: email, amount: amount})
            .pipe(
                catchError(this.handleError('withdraw', {}))
            );
    }

    getTransactions() {
        return this.http.get<TransactionsResponse>(`${appConfig['renterAddress']}/transactions`)
            .pipe(
                catchError(this.handleError('getTransactions', new TransactionsResponse()))
            );
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.log(`${operation} failed: ${error.error}`);

            this.zone.run(() => {
                let errMessage = (error.error.error) ? error.error.error : error.error;
                if (errMessage.target) {
                    errMessage = error.message;
                }
                this.snackBar.openFromComponent(NotificationComponent, {
                    data: errMessage,
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
