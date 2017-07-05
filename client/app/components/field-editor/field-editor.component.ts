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
    @Input() pair: any;
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

            if (propName == "pair" && changedProp.currentValue != undefined) {
                this.pair = changedProp.currentValue;
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                //this.collapsed = changedProp.currentValue;
            }
        }
    }

    private insert(pair) {
        this.onInsert.emit(pair);
    }
    private insertGroup(pair) {
        this.onInsertGroup.emit(pair);
    }
    private delete(pair) {
        this.onDelete.emit(pair);
    }
}
