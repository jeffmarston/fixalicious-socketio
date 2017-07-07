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
    template: `
        <div class="command-panel">
            <input type=checkbox 
                [checked]="selectedScenario.enabled"
                (change)="toggleEnabled()" />
            Enable

            <button 
                title="Run scenario"
                [disabled]="(!fixIn || !selectedScenario)"
                (click)="runScenario()">
                <i class="fa fa-send"></i> Run
            </button>
        </div>

        <div class="editor-area">
            <textarea class="code"
                [(ngModel)]="selectedScenario.code"></textarea>
                
            <code class="output" #output [scrollTop]="9999999">
                <span class="output" *ngFor="let line of outputLines" [style.color]="line.err ? 'red' : 'white'">{{line.text}}</span>
                <span class="output"> </span>
            </code>
        </div>
    `,
    styles: [` 
        textarea {
            height: 50px;
            width: 96%;
            font-family: 'Ubuntu', sans-serif;
            font-size: 14px; 
            background: whitesmoke;
        }
        textarea.code{
            color: blue;        
        }
        code.output{
            height: 45%;
            background: #222;
            margin-left: 4px; 
            display: block;
            overflow: auto;
        }
        span.output{
            margin-left: 4px; 
            font-family: 'Ubuntu', sans-serif;
            font-size: 13px; 
            display: block;
            white-space: pre-wrap;
        }

        .command-panel{
            padding: 12px 0 6px 0;
        }

        .container {
            width: 100%;
            height: 100%;
            background-color: #4ff;
            color: #88959E;
            transition: height .25s ease;
        }

        .label-input{
            width: 150px;
        }
        .add-button {
            border: none;
            background: transparent;
        }
        .add-button:hover {
            border-radius: 50%;
            background: #ddd;
        }
        .editor-area {
            display: flex;
            flex-direction: column;
        }
    `],
    providers: [ApiService]
})
export class ScenarioComponent implements OnInit {
    @Output() onSelected = new EventEmitter<ISession>();
    @Input() collapsed: boolean;
    @Input() session: any;
    @Input() fixIn: any;

    private selectedScenario;
    private scenarios = [];
    private isAdding = false;
    private socket;
    private outputLines = [];

    constructor(
        private scenarioService: ScenarioService) {
        this.socket = io();
    }

    ngOnInit() {

        this.selectedScenario = { label: "", code: null, enabled: false };
        this.scenarioService.getAll().subscribe(allScenarios => {
            this.scenarios = allScenarios;
            if (allScenarios.length > 0) {
                this.selectedScenario = allScenarios[0];
            }
        });
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "fixIn" && changedProp.currentValue != undefined) {
                this.fixIn = changedProp.currentValue;
            }

            if (propName == "session" && changedProp.currentValue != undefined) {
                this.session = changedProp.currentValue;
                let oldSession = changedProp.previousValue;

                this.socket.removeAllListeners(`scenario-output[${oldSession}]`);
                this.outputLines = [];

                this.scenarioService.getAll().subscribe(allScenarios => {
                    this.scenarios = allScenarios;
                    // if (allScenarios.length > 0) {
                    //     this.selectedScenario = allScenarios[0];
                    // }
                    // set enabled on each scenario
                    this.scenarios.forEach(scenario => {
                        scenario.enabled = false;
                        if (this.session.scenarios.indexOf(scenario.label) > -1) {
                            scenario.enabled = true;
                            this.selectedScenario = scenario;
                        }
                    });
                });



                this.socket.on(`scenario-output[${this.session.session}]`, outputObj => {
                    if (outputObj.scenario === this.selectedScenario.label) {
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

    public toggleEnabled() {
        this.selectedScenario.enabled = !this.selectedScenario.enabled;
        this.scenarioService.enable(this.session, this.selectedScenario);
    }

    public saveScenario() {
        this.isAdding = false;
        this.scenarioService.saveScenario(this.selectedScenario).subscribe(o => {
            console.log(o);
        });
    }

    public runScenario() {
        this.scenarioService.runScenario(this.selectedScenario.label, this.fixIn).subscribe(o => {
            console.log(o);
        });
    }

    public addScenario() {
        this.isAdding = true;
        this.selectedScenario = { label: "", code: "// Your code goes here!" };
        this.scenarios.splice(0, 0, this.selectedScenario);
    }

    public deleteScenario() {
        this.scenarioService.deleteScenario(this.selectedScenario).subscribe(o => {
            _.pull(this.scenarios, this.selectedScenario);
            if (this.scenarios.length > 0) {
                this.selectedScenario = this.scenarios[0];
            } else {
                this.addScenario();
            }
        });
    }
}
