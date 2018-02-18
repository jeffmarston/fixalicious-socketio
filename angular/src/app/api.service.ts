import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ISession } from './types';

const baseUrl = '/api';    

@Injectable()
export class ApiService {
    constructor(private http: Http) { }

    private wtf() {
        Observable;
    }

    // ============== Sessions =================

    public getSessions(): Observable<any> {
        return this.http.get(baseUrl + '/session')
            .map(res => res.json());
    }

    public createSession(session: ISession) {
        let url = baseUrl + '/session/' + encodeURIComponent(session.session);
        this.http.post(url, '')
            .subscribe(o => { });
    }

    // ============== Transactions =================

    public getTransactions(sessionId: string): Observable<any> {
        let url = baseUrl + '/transaction/' + encodeURIComponent(sessionId);
        return this.http.get(url)
            .map(res => res.json());
    }

    public createTransaction(sessionId: string, fixMsg: any) {
        let url = baseUrl + '/transaction/' + encodeURIComponent(sessionId);
        this.http.post(url, fixMsg )
            .subscribe(o => { console.log(o); });
    }

    // ============== Actions =================

    public getActions(): Observable<any> {
        return this.http.get(baseUrl + '/action')
            .map(res => res.json());
    }

    public deleteAction(action) {
        let url = baseUrl + '/action/' + encodeURIComponent(action.label);
        return this.http.delete(url);
    }

    public saveAction(action) {
        let url = baseUrl + '/action/' + encodeURIComponent(action.label);
        return this.http.post(url, action);
    }

    public runScenario(scenarioName: string, fixIn: any) {
        let url = baseUrl + '/action/run/' + encodeURIComponent(scenarioName);
        return this.http.post(url, fixIn);
    }
}
