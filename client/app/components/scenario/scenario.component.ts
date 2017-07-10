import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ApiService } from "../../services/api.service"
import { ScenarioService } from "../../services/scenario.service"
import { SetFocusDirective } from "../../directives/set-focus";
import { ISession } from "../../types.d"
import * as io from 'socket.io-client';
import * as _ from 'lodash';

@Component({
    selector: 'scenario',
    templateUrl: 'app/components/scenario/scenario.component.html',
    styleUrls: ['app/components/scenario/scenario.component.css'],
    providers: [ApiService]
})
export class ScenarioComponent implements OnInit {
    @Output() onEnabled = new EventEmitter<any>();
    @Input() name: string;
    @Input() action: any;
    @Input() session: any;
    @Input() sourceFix: any;

    private socket;
    private outputLines = [];

    constructor(
        private scenarioService: ScenarioService,
        private apiService: ApiService) {
        this.socket = io();
    }

    ngOnInit() {
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "session" && changedProp.currentValue != undefined) {
                this.session = changedProp.currentValue;
                let oldSession = changedProp.previousValue;

                this.socket.removeAllListeners(`scenario-output[${oldSession}]`);
                this.outputLines = [];

                // this.scenarioService.getAll().subscribe(allScenarios => {
                //     this.scenarios = allScenarios;
                //     // if (allScenarios.length > 0) {
                //     //     this.selectedScenario = allScenarios[0];
                //     // }
                //     // set enabled on each scenario
                //     this.scenarios.forEach(scenario => {
                //         scenario.enabled = false;
                //         if (this.session.scenarios.indexOf(scenario.label) > -1) {
                //             scenario.enabled = true;
                //             this.selectedScenario = scenario;
                //         }
                //     });
                // });



                this.socket.on(`scenario-output[${this.session.session}]`, outputObj => {
                    if (outputObj.scenario === this.name) {
                        if (outputObj.log) {
                            this.outputLines.push({ err: false, text: outputObj.log });
                        }
                        if (outputObj.error) {
                            this.outputLines.push({ err: true, text: outputObj.error });
                        }
                    }
                });
            }
        }
    }

    public leaveCode(srcElement) {
        this.action.code = srcElement.innerText;

        this.apiService.saveAction(this.action).subscribe(o => {
             console.log(o);
         });

    }

    public toggleEnabled() {
        // this.selectedScenario.enabled = !this.selectedScenario.enabled;
        // this.scenarioService.enable(this.session, this.selectedScenario);
    }

    public saveScenario() {
        // this.isAdding = false;
        // this.scenarioService.saveScenario(this.selectedScenario).subscribe(o => {
        //     console.log(o);
        // });
    }

    public runScenario() {
        this.scenarioService.runScenario(this.name, this.sourceFix).subscribe(o => {
            console.log(o);
        });
    }

    // public addScenario() {
    //     this.isAdding = true;
    //     this.selectedScenario = { label: "", code: "// Your code goes here!" };
    //     this.scenarios.splice(0, 0, this.selectedScenario);
    // }

    // public deleteScenario() {
    //     this.scenarioService.deleteScenario(this.selectedScenario).subscribe(o => {
    //         _.pull(this.scenarios, this.selectedScenario);
    //         if (this.scenarios.length > 0) {
    //             this.selectedScenario = this.scenarios[0];
    //         } else {
    //             this.addScenario();
    //         }
    //     });
    // }
}
