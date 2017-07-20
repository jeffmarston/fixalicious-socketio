import {
    Component, EventEmitter, Input, Output,
    SimpleChange, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ApiService } from "../../services/api.service"
import { SetFocusDirective } from "../../directives/set-focus";
import { ISession } from "../../types.d"
import * as io from 'socket.io-client';
import * as _ from 'lodash';

import "brace";
import "brace/mode/javascript";
import "brace/theme/chrome";

@Component({
    selector: 'ace-code-editor',
    templateUrl: 'app/components/editors/ace.component.html',
    styleUrls: ['app/components/editors/ace.component.css'],
    providers: [ApiService]
})
export class AceComponent implements AfterViewInit {
    @ViewChild('outputScroll') private outputScroll: ElementRef;
    @ViewChild('codeEditor') private editor;
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

    ngAfterViewInit() {
        this.editor.getEditor().on('blur', ()=> this.saveCode());
        
        this.editor.getEditor().$blockScrolling = Infinity;
        this.editor.setMode("javascript");
        //this.editor.setTheme("chrome");
        
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
        if (this.session) {
            this.isEnabled = this.action.enabledSessions.indexOf(this.session.session) > -1;
        }
    }

    public saveCode() {
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
