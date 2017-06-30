import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ApiService } from "../../services/api.service"
import { ScenarioService } from "../../services/scenario.service"
import { ISession } from "../../types.d"
import * as io from 'socket.io-client';
import * as _ from 'lodash';

@Component({
    selector: 'scenario',
    template: `
        <div>
        <input type=checkbox 
            [checked]="isChecked"
            (change)="enable(isChecked)" 
           />Run Scenario</div>
        <textarea [(ngModel)]="code"></textarea>
        <div class="button-panel">
            <button (click)="saveScenario()">Save</button>
        </div>
    `,
    styles: [` 
        textarea {
            height: 400px;
            width: 100%;
            box-model: border-box;
        }

        .container {
            width: 100%;
            height: 100%;
            background-color: #4ff;
            color: #88959E;
            transition: height .25s ease;
        }

    `],
    providers: [ApiService]
})
export class ScenarioComponent implements OnInit {
    @Output() onSelected = new EventEmitter<ISession>();
    @Input() collapsed: boolean;

    private isEnabled: boolean;
    private code: string = `
if (source.message.body[6].Value === "IBM") {
  fixToSend.LastShares = 111;
  send(fixToSend);
}`;

    constructor(
        private scenarioService: ScenarioService) {
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                //this.isCollapsed = changedProp.currentValue;
            }
        }
    }

    public enable(model, value){
        this.isEnabled = !this.isEnabled;
        this.scenarioService.enable(this.isEnabled);
    }

    public saveScenario(){
        this.scenarioService.setScenario(this.code);
    }

    ngOnInit() {
    }
}
