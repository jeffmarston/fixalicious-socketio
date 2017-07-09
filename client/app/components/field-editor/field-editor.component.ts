import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { ApiService } from "../../services/api.service"
import { FixParserService } from "../../services/fix-parser.service"
import { ISession, IFixMessage, ITransaction, IPair } from "../../types.d";
import { SetFocusDirective } from "../../directives/set-focus";
import * as io from 'socket.io-client';
import * as _ from "lodash";

@Component({
    selector: 'field-editor',
    templateUrl: "app/components/field-editor/field-editor.component.html",
    styleUrls: ["app/components/field-editor/field-editor.component.css"],
    providers: [ApiService]
})
export class FieldEditorComponent implements OnInit {
    @Input() action: string;
    @Input() template: any;
    @Input() level: number = 0;
    @Input() editMode = false;
    @Input() sourceFix: any;
    @Input() session: any;

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService) {
    }

    ngOnInit() {
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            // if (propName == "name" && !changedProp.currentValue) {
            //     if (!this.template || this.template.length === 0) {
            //         this.template = [{}]
            //     };
            // }
            // if (propName == "sourceFix" && changedProp.currentValue != undefined) {
            //     this.sourceFix = changedProp.currentValue;
            // }
            // if (propName == "session" && changedProp.currentValue != undefined) {
            //     this.editMode = changedProp.currentValue;
            // }
        }
        this.evalAll();
        if (this.template && this.template.length === 1 && this.template[0].key === "") {
            this.editMode = true;
        }
    }

    private edit() {
        this.editMode = !this.editMode;

        // apply and save
        if (!this.editMode) {
            // Remove all empty ones
            _.remove(this.template, o=>(o.key==="" && o.formula===""));

            this.apiService.saveAction(this.action).subscribe(o => {
                console.log("Action saved");
            });

            if (this.sourceFix) {
                this.evalAll();
            }
        }
    }

    private evalAll() {
        if (this.template && this.sourceFix) {
            this.template.forEach(element => {
                this.fixParserService.eval(element, this.sourceFix.message);
            });
        }
    }

    private send() {
        let mapToSend = (array) => {
            let obj = {};
            array.forEach(element => {
                if (!obj[element.key]) {
                    // if element has children, recurse into them
                    if (Array.isArray(element.value)) {
                        obj[element.key] = mapToSend(element.value);
                    } else {
                        obj[element.key] = element.value;
                    }
                } else {
                    // element already exists, transform element into an array
                    if (Array.isArray(obj[element.key])) {
                        obj[element.key].push(mapToSend(element.value));
                    } else {
                        obj[element.key] = [obj[element.key], mapToSend(element.value)];
                    }
                }
            });
            return obj;
        };

        let fixToSend = mapToSend(this.template);
        console.log(fixToSend);
        this.apiService.createTransaction(this.session.session, fixToSend);
    }

    private leaveValue(pair) {
        let index = this.template.indexOf(pair);
        if (index === this.template.length - 1) {
            this.insertAtBottom();
        }
    }

    private insertAbove(pair) {
        let index = this.template.indexOf(pair);
        let item = { key: "", formula: "", value: "" };
        this.template.splice(index, 0, item);
    }

    private insertBelow(pair) {
        let index = this.template.indexOf(pair);
        let item = { key: "", formula: "", value: "" };
        this.template.splice(index + 1, 0, item);
    }

    private insertAtBottom() {
        let item = { key: "", formula: "", value: "" };
        this.template.push(item);
    }

    private insertGroup(pair) {
        let index = this.template.indexOf(pair);
        let groupItem = {
            key: "",
            value: "",
            formula: [{
                key: "",
                formula: "",
                value: ""
            }]
        };
        this.template.splice(index, 0, groupItem);
    }
    private delete(pair) {
        let index = this.template.indexOf(pair);
        this.template.splice(index, 1);
    }
    private isRepeatingGroup(pair) {
        return Array.isArray(pair.formula);
    }
}
