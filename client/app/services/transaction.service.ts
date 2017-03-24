import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class TransactionApiService {
    private baseurl = "/transaction";

    constructor(private http: Http) {
    }

    private pollForServices() {
        Observable;//.create();
    }

    public getTransactions(channel: string): Observable<any> {
        return this.http.get(this.baseurl + "/" + channel)
            .map(res => res.json());
    }

    public createTransaction(svcId: string, symbol: string) {
        let url = `${this.baseurl}/${svcId}?symbol=${symbol}`;
        this.http.post(url, "")
            .subscribe(o => { });
    }
}