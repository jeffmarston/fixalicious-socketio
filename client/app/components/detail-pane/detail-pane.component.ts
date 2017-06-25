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
                <tr *ngFor="let pair of selectedAction.pairs"
                    [hidden]="isConfiguring" >
                    <td class="key"><span>{{pair.key}}</span></td>
                    <td class="value">
                        <input 
                            [hidden]="isConfiguring"
                            [(ngModel)]="pair.value"/>
                    </td>
                </tr>
                <tr *ngFor="let pair of selectedAction.pairs" 
                    [hidden]="!isConfiguring">
                    <td class="key">
                        <input 
                            class="configure-key"
                            (blur)="doneEditingPair(pair)"
                            [(ngModel)]="pair.key"/>

                    <!--  <select class="configure-input" [(ngModel)]="pair.key">
                            <option *ngFor="let str of fixFields" [value]="str">{{str}}</option>
                        </select> -->
                    <td class="value">
                        <input class="configure-input"                            
                            [(ngModel)]="pair.formula"/>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    `,
    styleUrls: ["app/components/detail-pane/detail-pane.component.css"],
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
    private fixFields = ["OrderID", "ClOrdID", "Symbol", "ExecID", "ExecType"];

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
        if (action.isEditing) {
            action.isEditing = false;
            this.clientsService.createTemplate(action).subscribe(o => {
                this.selectedAction = action;
                this.isConfiguring = true;
            });
        }
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
        this.clientsService.deleteTemplate(this.selectedAction)
            .subscribe(success => {
                let index = this.customActions.indexOf(this.selectedAction);
                _.pull(this.customActions, this.selectedAction);
                if (index > 0) {
                    this.selectedAction = this.customActions[index - 1];
                } else if (index < this.customActions.length) {
                    this.selectedAction = this.customActions[index];
                }
                this.prepareTemplate(this.selectedAction);
            }, error => {
                console.error("Failed to delete template: " + error);
            });
    }

    private configureTemplate() {
        this.isConfiguring = !this.isConfiguring;
        if (this.isConfiguring) {
            this.selectedAction.pairs.push({
                key: "",
                formula: "",
                value: "",
                isNewItem: true
            });
        } else {
            _.pullAt(this.selectedAction.pairs, this.selectedAction.pairs.length-1);
            this.clientsService.createTemplate(this.selectedAction).subscribe(o=>{
                console.log("Template saved");
            });;
        }
        this.displayFixMessage();
    }

    private displayFixMessage() {
        this.selectedAction.pairs.forEach(element => {
            let resolved = this.fixParserService.eval(element.formula, this.sourceFixObj);
            element.value = resolved;
        });
    }
    
    private doneEditingPair(pair) {
        let lastPair = this.selectedAction.pairs[this.selectedAction.pairs.length-1];
        if (lastPair.key.trim() !== "") {
            pair.isNewItem = false;
             this.selectedAction.pairs.push({
                key: "",
                formula: "",
                value: "",
                isNewItem: true
            });
        }
    }

    ngOnInit() {
        this.collapsed = localStorage.getItem("detail-pane-collapsed") === "true";
    }

}
