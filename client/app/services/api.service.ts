import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ISession } from "../types"

@Injectable()
export class ApiService {
    private baseurl = "/session";

    constructor(private http: Http) {
    }

    private pollForServices() {
        Observable;//.create();
    }

    // ============== Sessions =================

    public getSessions(): Observable<any> {
        return this.http.get(this.baseurl)
            .map(res => res.json());
    }

    public createSession(session: ISession) {
        let url = `${this.baseurl}/${session.session}`;
        this.http.post(url, "")
            .subscribe(o => { });
    }

    // ============== Transactions =================
    
    public getTransactions(channel: string): Observable<any> {
        return this.http.get("/transaction/" + channel)
            .map(res => res.json());
    }

    public createTransaction(sessionId: string, fixMsg: any) {
        let url = `/transaction/${sessionId}`;
        this.http.post(url, fixMsg )
            .subscribe(o => { console.log(o); });
    }

    // ============== Templates =================

    public getTemplates(): Observable<any> {
        return this.http.get("/template")
            .map(res => res.json());
    }

    public deleteTemplate(template) {
        let url = `/template/${template.label}`;
        return this.http.delete(url);
    }

    public createTemplate(template) {
        let url = `/template/${template.label}`;
        return this.http.post(url, template);
    }
}