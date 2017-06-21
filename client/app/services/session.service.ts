import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ISession } from "../types"

@Injectable()
export class SessionService {
    private baseurl = "/session";

    constructor(private http: Http) {
    }

    private pollForServices() {
        Observable;//.create();
    }

    public getSessions(): Observable<any> {
        return this.http.get(this.baseurl)
            .map(res => res.json());
    }

    public createSession(session: ISession) {
        let url = `${this.baseurl}/${session.name}`;
        this.http.post(url, "")
            .subscribe(o => { });
    }

    public getTemplates(): Observable<any> {
        return this.http.get("/template")
            .map(res => res.json());
    }
}