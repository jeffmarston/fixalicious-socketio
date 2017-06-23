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
                (click)="toggleExpanded()">>></button>

            <button 
                [ngClass]="(!collapsed && selectedAction==action) ? 'selected' : '' "
                *ngFor="let action of customActions"
                (click)="prepareTemplate(action)">
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
                            [hidden]="!selectedAction"
                            (click)="send()">Send
                            </button>
                            
                        <button class="send" 
                            [hidden]="!selectedAction"
                            (click)="deleteTemplate()">Delete</button>
                            
                        <button class="send" 
                            [hidden]="!selectedAction"
                            (click)="configureTemplate()"
                            [ngClass]="isConfiguring ? 'configure-input' : '' ">Configure</button>
                    </td>
                </tr>
                <tr *ngFor="let pair of selectedAction.pairs" >
                    <td class="key"><span>{{pair.key}}</span></td>
                    <td class="value">
                        <input 
                            [hidden]="isConfiguring"
                            [(ngModel)]="pair.value"/>
                        <input class="configure-input"
                            [hidden]="!isConfiguring"
                            [(ngModel)]="pair.formula"/>
                    </td>
                </tr>
                <tr>
                    <td colspan=2>
                        <button 
                            class="pull-right"
                            [hidden]="!isConfiguring"
                            (click)="saveTemplate()">Save</button>
                    </td>
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

        td>input {
            border: 1px solid gray;
            padding: 3px;
            margin-right: 2px;
        }

        .keyvalue-section {
            overflow: auto;
            background: #eee;
            min-width: 300px;
            border: 1px solid gray;
        }

        table.keyvalue-table {
            font-size: 12px;
            border-collapse: collapse;
        }

        td {
            padding: 2px 4px;
            width: 50%;
        }

        td.key {
            white-space: nowrap;
            text-align: right;
        }

        button { 
            height: 24px;
            padding: 2px;
            margin: 2px;  
            width: 69px;
            border: 1px gray solid; 
        }
        
        .configure-input {
            background: #bfb;
            border: 1px solid gray;
        }
        button.configure-input:hover {
            background: #bfb;
        }

        button:hover {
            background: #eee;
            cursor: pointer;
        }

        button:active {
            background: #b0e0e6;
        }

        button.expander {
            border: none;
            background: transparent;
        }

        button.send {
            float: right;
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
            background: #fff;
        }

        .editable-input.hidden {
            width: 0;
            height: 0;
            opacity: 0;
        }

        .editable-input.visible {
            width: 100%;
            height: 30px;
        }

        .readonly-input {
            background: transparent;
            cursor: pointer;
        }

        .pull-right {
            float: right;
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
    private sourceFixObj = {};
    private fixToSend = {};
    private socket;
    private isAddingAction = false;
    private isConfiguring = false;
    private customActions = [];
    private selectedAction = null;

    constructor(
        private clientsService: SessionService,
        private apiDataService: TransactionApiService,
        private fixParserService: FixParserService) {
        this.isValid = true;
        this.socket = io();

        this.clientsService.getTemplates().subscribe(o => {
            this.customActions = o;
            if (this.customActions.length > 0) {
                this.selectedAction = this.customActions[0];
            } else {
            }
        });

        this.selectedAction = {
            label: "", isEditing: true, pairs: []
        };
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "detail" && changedProp.currentValue != undefined) {
                this.transaction = changedProp.currentValue;
                this.sourceFixObj = this.fixParserService.parseFix(this.transaction.message);
                this.isValid = true;

                if (this.selectedAction) {
                    this.prepareTemplate(this.selectedAction);
                }
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                this.collapsed = changedProp.currentValue;
            }
        }
    }

    private toggleExpanded() {
        this.collapsed = !this.collapsed;
        localStorage.setItem("detail-pane-collapsed", this.collapsed.toString());
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

    private prepareTemplate(action) {
        this.selectedAction = action;

        this.fixToSend = {};
        action.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            element.value = resolved;
            this.fixToSend[element.key] = { value: resolved, formula: element.formula };
        });

        this.displayFixMessage();
        if (this.collapsed) {
            this.send();
        }
    }

    private send() {
        let fixObj = this.fixParserService.generateFix(this.selectedAction.pairs);
        this.apiDataService.createTransaction(this.session.name, fixObj);

        if (!this.collapsed) {
            // set a new ExecID so user can repeated hit send button
            this.fixToSend["ExecID"] = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
            this.displayFixMessage();
        }
    }

    private deleteTemplate() {
        let index = this.customActions.indexOf(this.selectedAction);
        _.pull(this.customActions, this.selectedAction)
        if (index > 0) {
            this.selectedAction = this.customActions[index - 1];
        } else if (index < this.customActions.length) {
            this.selectedAction = this.customActions[index];
        }
        this.prepareTemplate(this.selectedAction);
    }

    private configureTemplate() {
        this.isConfiguring = !this.isConfiguring;
        this.displayFixMessage();
    }
    

    private displayFixMessage() {        
        this.selectedAction.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            element.value = resolved;
        });
    }

    private saveTemplate() {
        console.log(this.selectedAction.pairs[0]);
        this.selectedAction.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            element.value = resolved;
        });

       // this.prepareTemplate(this.selectedAction);
    }

    ngOnInit() {
        this.collapsed = localStorage.getItem("detail-pane-collapsed") === "true";
    }

}
