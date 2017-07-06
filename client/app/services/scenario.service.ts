import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { ApiService } from "./api.service";
import { ITransaction } from "../types"

@Injectable()
export class ScenarioService {
    private code: string;
    private template: any;

    constructor(
        private apiService: ApiService,
        private http: Http) {
        this.template = {};
    }

    public enable(session, scenario) {
        let url = "/session/" + encodeURIComponent(session.session) + "/scenario";
        let postBody = { enable: [], disable: [] };
        if (scenario.enabled) {
            postBody.enable.push(scenario.label);
        } else {
            postBody.disable.push(scenario.label);
        }

        return this.http.post(url, postBody).subscribe(o=>{
            console.log(o);
        });
    }

    public runScenario(scenarioName: string, fixIn: any) {
        let url = "/scenario/run/" + encodeURIComponent(scenarioName);
        return this.http.post(url, fixIn);
    }

    public saveScenario(scenario: any) {
        let url = "/scenario/" + encodeURIComponent(scenario.label);
        return this.http.post(url, scenario);
    }

    public deleteScenario(scenario: any) {
        let url = "/scenario/" + encodeURIComponent(scenario.label);
        return this.http.delete(url);
    }

    public getAll(){        
        return this.http.get("/scenario")
            .map(res => res.json());
    }
}