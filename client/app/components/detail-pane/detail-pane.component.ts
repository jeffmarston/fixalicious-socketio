import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { SessionService } from "../../services/session.service"
import { FixParserService } from "../../services/fix-parser.service"
import { TransactionApiService } from "../../services/transaction.service"
import { ISession, IFixMessage, ITransaction } from "../../types.d";
import { SetFocusDirective } from "../../directives/set-focus";
import * as io from 'socket.io-client';
import * as _ from "lodash";

@Component({
    selector: 'detail-pane',
    template: `
    <div class="container" [style.width]="collapsed ? '80px' : '400px'" > 
        <div class="button-section">
            <button 
                class="expander" 
                title="Show the FIX messages to be sent"
                (click)="collapsed = !collapsed">>></button>

            <button 
                [ngClass]="(!collapsed && activeButton==action.label) ? 'selected' : '' "
                *ngFor="let action of customActions"
                (click)="prepareTemplate(action)"
            >
                <input 
                    (blur)="doneEditing(action)"
                    [readonly]="!action.isEditing"
                    [(ngModel)]="action.label"
                    [setFocus]="action.isEditing"
                    [ngClass]="action.isEditing ? 'editable-input' : 'readonly-input' "
                />
            </button>          

            <button class="add-action"
                title="Add a new quick action button"
                [hidden]="collapsed"
                (click)="addAction()"
            >+</button>

        </div>
        <div class="keyvalue-section" [hidden]="collapsed">
            <table class="keyvalue-table">
                <tr>
                    <td colspan=2>
                        <button class="send" 
                            [hidden]="!activeButton"
                            (click)="send()">Send</button></td>
                </tr>
                <tr *ngFor="let pair of kvPairs" >
                    <td class="key"><span>{{pair.key}}</span></td>
                    <td class="value"><input [(ngModel)]="pair.value"/></td>
                </tr>
            </table>
        </div>
    </div>
    `,
    styles: [` 
        
        .container {
            overflow: auto;
            height: 100%;
            transition: width .25s ease;
            width: 25%;
            float: left;
            display: flex;
            flex-direction: row;
        }

        .button-section {
            display: flex;
            flex-direction: column;
            padding-left: 4px;
        }

        button.selected {
            border-right: 0;
            margin-left: 8px;
            margin-right: -1px;
            background: #eee;
            z-index: 100;
        }

        .keyvalue-section {
            overflow: auto;
            border-collapse: collapse;
            background: #eee;
            min-width: 300px;
            border: 1px solid gray;
        }

        .keyvalue-table {
            font-size: 12px;
        }

        .key {
            white-space: nowrap;
            width: 50%;
        }

        .value {
            width: 50%;
        }

        button { 
            height: 24px;
            padding: 2px;
            margin: 2px;  
            width: 69px;
            border: 1px gray solid; 
        }

        button:hover {
            background: #eee;
            cursor: pointer;
        }

        button.expander {
            border: none;
            background: transparent;
        }

        button.send {
            width: 100%;
            margin: 0;
        }
        
        button.add-action {
            background: transparent;    
            border: none;
            width: 26px;
            border-radius: 50%;
            margin-left: 20px;
        }
        button.add-action:hover {
            x-background: #b0e0e6;    
            background: #ddd;    
        }
        
        button>input {
            width: 100%;
            border: none;
            text-align:center
        }

        .editable-input {
            transition: height .1s ease;
            background: #fff;
        }

        .editable-input.hidden {
            width: 0;
            height: 0;
            opacity: 0;
        }

        .editable-input.visible {
            opacity: 1;
            width: 100%;
            height: 30px;
        }

        .readonly-input {
            background: transparent;
            cursor: pointer;
        }
        
    `],
    providers: [SessionService]
})
export class DetailPane implements OnInit {
    @Input() detail: ITransaction;
    @Input() collapsed: boolean = true;
    @Input() session: ISession;

    private transaction: ITransaction;
    private isValid: boolean;
    private kvPairs: any[] = [];
    private sourceFixObj = {};
    private fixToSend = {};
    private socket;
    private isAddingAction = false;
    private customActions = [];
    private activeButton = null;

    constructor(
        private clientsService: SessionService,
        private apiDataService: TransactionApiService,
        private fixParserService: FixParserService) {
        this.isValid = true;
        this.socket = io();


        this.clientsService.getTemplates().subscribe(o => {
            this.customActions = o;
        });
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "detail" && changedProp.currentValue != undefined) {
                this.transaction = changedProp.currentValue;
                this.sourceFixObj = this.fixParserService.parseFix(this.transaction.message);
                this.isValid = true;

                if (this.activeButton) {
                    let action = _.find(this.customActions, o=>o.label == this.activeButton);
                    this.prepareTemplate(action);
                }
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                this.collapsed = changedProp.currentValue;
            }
        }
    }

    private addAction() {
        let newAction = {
            label: "", isEditing: true, pairs: [
                { key: "MsgType", formula: "D" }
            ]
        };
        this.customActions.push(newAction);
    }

    private doneEditing(action) {
        action.isEditing = false;
    }

    private displayFixMessage() {
        this.kvPairs = [];

        for (var property in this.fixToSend) {
            if (this.fixToSend.hasOwnProperty(property)) {
                this.kvPairs.push({
                    key: property,
                    value: this.fixToSend[property]
                });
            }
        }
    }

    private prepareTemplate(action) {
        if (!this.collapsed) {
            this.activeButton = action.label;
        }

        this.fixToSend = {};
        action.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            this.fixToSend[element.key] = resolved;
        });

        this.displayFixMessage();
        if (this.collapsed) {
            this.send();
        }
    }

    private send() {
        let fixObj = this.fixParserService.generateFix(this.kvPairs);
        this.apiDataService.createTransaction(this.session.name, fixObj);

        if (!this.collapsed) {
            // set a new ExecID so user can repeated hit send button
            this.fixToSend["ExecID"] = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
            this.displayFixMessage();
        }
    }

    ngOnInit() {

    }

}
