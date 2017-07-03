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
                [checked]="isChecked"
                (change)="enable(isChecked)" />
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

        <textarea [(ngModel)]="selectedScenario.code"></textarea>
    `,
    styles: [` 
        textarea {
            height: 400px;
            width: 100%;
            box-model: border-box;
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
        
    `],
    providers: [ApiService]
})
export class ScenarioComponent implements OnInit {
    @Output() onSelected = new EventEmitter<ISession>();
    @Input() collapsed: boolean;

    private isEnabled: boolean;
    private selectedScenario;
    private code: string = `
let source = JSON.parse(incomingFix);
let fixToSend = JSON.parse(incomingFix);

if (source.message.body[6].Value === "IBM") {
  fixToSend.LastShares = 111;
  send(fixToSend);
}`;
    private scenarios = [];
    private isAdding = false;

    constructor(
        private scenarioService: ScenarioService) {
        this.selectedScenario = { label: "", code: "" };
    }

    ngOnInit() {
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

            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                //this.isCollapsed = changedProp.currentValue;
            }
        }
    }

    public enable(model, value) {
        this.isEnabled = !this.isEnabled;
        this.scenarioService.enable(this.isEnabled);
    }

    public saveScenario() {
        this.isAdding = false;
        this.scenarioService.saveScenario(this.selectedScenario).subscribe(o => {
            console.log(o);
        });;
    }

    public addScenario() {
        this.isAdding = true;
        this.selectedScenario = { label: "", code: "// You code goes here!" };
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
