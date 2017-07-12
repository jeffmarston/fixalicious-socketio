import { Component, OnInit, EventEmitter, Input, Output, SimpleChange, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ApiService } from "../../services/api.service"
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
    @ViewChild('outputScroll') private outputScroll: ElementRef;
    @Output() onEnabled = new EventEmitter<any>();
    @Input() name: string;
    @Input() action: any;
    @Input() session: ISession;
    @Input() sourceFix: any;

    private socket;
    private isEnabled = false;
    private outputLines = [];
    private output = "";

    constructor(
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
                this.output = "";

                this.socket.on(`scenario-output[${this.session.session}]`, outputObj => {
                    if (outputObj.scenario === this.name) {
                        if (outputObj.log) {
                            this.outputLines.push({ err: false, text: outputObj.log });
                            this.output += outputObj.log + "\n";
                        }
                        if (outputObj.error) {
                            this.outputLines.push({ err: true, text: outputObj.error });
                            this.output += "(!) " + outputObj.error + "\n";
                        }

                        //scroll to bottom of output window
                        try {
                            this.outputScroll.nativeElement.scrollTop = this.outputScroll.nativeElement.scrollHeight;
                        } catch (err) { }
                    }
                });
            }
        }
        this.isEnabled = this.action.enabledSessions.indexOf(this.session.session) > -1;
    }

    public leaveCode(srcElement) {
        this.apiService.saveAction(this.action).subscribe(o => {
            console.log(o);
        });
    }

    public toggleEnabled() {
        this.isEnabled = !this.isEnabled;
        this.action.enabledSessions || [];

        _.pull(this.action.enabledSessions, this.session.session);
        if (this.isEnabled) {
            this.action.enabledSessions.push(this.session.session);
        }

        this.apiService.saveAction(this.action).subscribe(o => {
            this.isEnabled = this.action.enabledSessions.indexOf(this.session.session) > -1;
            this.onEnabled.emit(this.isEnabled);
        });
    }

    public runScenario() {
        this.apiService.runScenario(this.name, this.sourceFix).subscribe(o => {
            console.log(o);
        });
    }
}
