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
    @Input() template: any;
    @Input() level: number = 0;
    @Output() onInsert = new EventEmitter<any>();
    @Output() onInsertGroup = new EventEmitter<any>();
    @Output() onDelete = new EventEmitter<any>();

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService) {
    }

    ngOnInit() {
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "template" && changedProp.currentValue != undefined) {
                this.template = changedProp.currentValue;
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                //this.collapsed = changedProp.currentValue;
            }
        }
    }

    private insert(pair) {
        let index = this.template.indexOf(pair);
        let item = {
            key: "",
            formula: "",
            value: ""
        };
        this.template.splice(index, 0, item);
    }
    private insertGroup(pair) {
        let index = this.template.indexOf(pair);
        let groupItem = {
            key: "",
            formula: "",
            value: [{
                key: "grant",
                formula: "sleep"
            }]
        };
        this.template.splice(index, 0, groupItem);
    }
    private delete(pair) {
        this.onDelete.emit(pair);
    }
    private isRepeatingGroup(pair) {
        return Array.isArray(pair.value);
    }
}
