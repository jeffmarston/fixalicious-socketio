import { Injectable } from 'angular2/core';
import { Http, Response, Headers, RequestOptions } from 'angular2/http';
import { IAgency, IRating } from "./types";
import { Observable }  from 'rxjs/Rx';

@Injectable()
export class AgencyRatingsService {
    constructor(private http: Http) {
    }

    public getAllAgencyRatings(): Observable<IAgency[]> {
        let headers = new Headers({ 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' });
        let options = new RequestOptions({ headers: headers });

        return this.http.get("http://localhost:3000/api/library/v1/rating", options)
        // return this.http.get("app/data.json")
            .map(response => {
                var foo =  response.json();
                return foo;
            })
            .catch((error) => {
                console.error(error);
                return Observable.throw(error.text);
            });
    }

    public saveAgencyRatings(agencyCode, ratingsList): Observable<IRating[]> {
        console.log("saveAgencyRatings for " + agencyCode);
        if(!agencyCode || agencyCode == "" || !ratingsList)
            throw Error("Invalid Paramteres to saveAgencyRatings");

        let url = 'http://localhost:3000/api/library/v1/rating/' + agencyCode;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, JSON.stringify(ratingsList), options)
        .map( response => response.json() )
        .catch( error => Observable.throw(error) );
    }    
}