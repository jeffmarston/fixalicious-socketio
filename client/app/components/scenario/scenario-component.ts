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
            <input class="label-input"
                [(ngModel)]="selectedScenario.label"
                [hidden]="!isAdding" 
                [setFocus]="isAdding"
                (blur)="isAdding=false" />
            <select class="label-input"
                [(ngModel)]="selectedScenario"
                [hidden]="isAdding">
                <option *ngFor="let scenario of scenarios" [ngValue]="scenario">
                {{scenario.label}}</option>
            </select>
        
            <button class="add-button"
                title="Add a new scenario"
                (click)="addScenario()"
                style="color:#777;">
                <i class="fa fa-plus-circle"></i>
            </button>

            <button 
                title="Run scenario"
                [disabled]="(!fixIn || !selectedScenario)"
                (click)="runScenario()">
                <i class="fa fa-send"></i> Run
            </button>

            <button 
                title="Save changes"
                (click)="saveScenario()">
                <i class="fa fa-save"></i> Save
            </button>
            
            <button class="" 
                (click)="deleteScenario()"
                title="Delete this scenario">
                <i class="fa fa-trash-o"></i> Delete
            </button>
        </div>

        <div class="editor-area">
            <textarea class="code"
                [(ngModel)]="selectedScenario.code"></textarea>
            <!--<textarea class="output"
                readonly="true"
                [value]="output"></textarea>-->
                
            <code class="output" #output [scrollTop]="9999999">
                <span class="output" *ngFor="let line of outputLines" [style.color]="line.err ? 'red' : 'white'">{{line.text}}</span>
                <span class="output"> </span>
            </code>
        </div>
    `,
    styles: [` 
        textarea {
            height: 400px;
            width: 200%;
            font-family: 'Ubuntu', sans-serif;
            background: #222;
        }
        textarea.code{
            color: #bef;        
        }
        code.output{
            height: 100%;
            height: 400px;
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
    private code: string = `
let fixOut = JSON.parse(fixIn);

if (source.message.body.Value === "IBM") {
  fixOut.LastShares = 111;
  send(fixOut);
}`;
    private scenarios = [];
    private isAdding = false;
    private socket;
    private outputLines = [
        { err: false, text: `"{"ClOrdID":{"Tag":11,"Name":"ClOrdID","Value":"20170703007D"},"HandlInst":{"Tag":21,"Name":"HandlInst","Value":"3"},"OrderQty":{"Tag":38,"Name":"OrderQty","Value":"600"},"OrdType":{"Tag":40,"Name":"OrdType","Value":"1"},"Price":{"Tag":44,"Name":"Price","Value":"0"},"Side":{"Tag":54,"Name":"Side","Value":"1"},"Symbol":{"Tag":55,"Name":"Symbol","Value":"IBM"},"TimeInForce":{"Tag":59,"Name":"TimeInForce","Value":"0"},"TransactTime":{"Tag":60,"Name":"TransactTime","Value":"20170703-18:08:58.000"},"SecurityExchange":{"Tag":207,"Name":"SecurityExchange","Value":"New York"}}"` },
        {
            err: true, text: `"Cannot read property 'Value' of undefined
TypeError: Cannot read property 'Value' of undefined
    at evalmachine.<anonymous>:5:35
    at ContextifyScript.Script.runInContext (vm.js:35:29)
    at ContextifyScript.Script.runInNewContext (vm.js:41:15)
    at Function.executeCode (d:\\Repo\\tools\\fixalicious-ui\\server\\models\\scenario-model.js:103:20)
    at Function.trigger (d:\\Repo\\tools\\fixalicious-ui\\server\\models\\scenario-model.js:69:27)
    at Command.handleTransactions [as callback] (d:\\Repo\\tools\\fixalicious-ui\\server\\models\\redis-watcher.js:37:31)
    at normal_reply (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis\\index.js:721:21)
    at RedisClient.return_reply (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis\\index.js:819:9)
    at JavascriptRedisParser.returnReply (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis\\index.js:192:18)
    at JavascriptRedisParser.execute (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis-parser\\lib\\parser.js:574:12)"`},
        { err: false, text: `"{"ClOrdID":{"Tag":11,"Name":"ClOrdID","Value":"20170703007D"},"HandlInst":{"Tag":21,"Name":"HandlInst","Value":"3"},"OrderQty":{"Tag":38,"Name":"OrderQty","Value":"600"},"OrdType":{"Tag":40,"Name":"OrdType","Value":"1"},"Price":{"Tag":44,"Name":"Price","Value":"0"},"Side":{"Tag":54,"Name":"Side","Value":"1"},"Symbol":{"Tag":55,"Name":"Symbol","Value":"IBM"},"TimeInForce":{"Tag":59,"Name":"TimeInForce","Value":"0"},"TransactTime":{"Tag":60,"Name":"TransactTime","Value":"20170703-18:08:58.000"},"SecurityExchange":{"Tag":207,"Name":"SecurityExchange","Value":"New York"}}"` },
        {
            err: true, text: `"Cannot read property 'Value' of undefined
TypeError: Cannot read property 'Value' of undefined
    at evalmachine.<anonymous>:5:35
    at ContextifyScript.Script.runInContext (vm.js:35:29)
    at ContextifyScript.Script.runInNewContext (vm.js:41:15)
    at Function.executeCode (d:\\Repo\\tools\\fixalicious-ui\\server\\models\\scenario-model.js:103:20)
    at Function.trigger (d:\\Repo\\tools\\fixalicious-ui\\server\\models\\scenario-model.js:69:27)
    at Command.handleTransactions [as callback] (d:\\Repo\\tools\\fixalicious-ui\\server\\models\\redis-watcher.js:37:31)
    at normal_reply (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis\\index.js:721:21)
    at RedisClient.return_reply (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis\\index.js:819:9)
    at JavascriptRedisParser.returnReply (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis\\index.js:192:18)
    at JavascriptRedisParser.execute (d:\\Repo\\tools\\fixalicious-ui\\server\\node_modules\\redis-parser\\lib\\parser.js:574:12)"`}
    ];

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
