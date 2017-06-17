import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { SessionService } from "../../services/session.service"
import { FixParserService } from "../../services/fix-parser.service"
import { TransactionApiService } from "../../services/transaction.service"
import { ISession, IFixMessage, ITransaction } from "../../types.d";
import { SetFocusDirective } from "../../directives/set-focus";
import * as io from 'socket.io-client';

@Component({
    selector: 'detail-pane',
    template: `
    <div class="container" [style.width]="collapsed ? '80px' : '400px'" > 
        <div class="button-section">
            <button class="expander" (click)="collapsed = !collapsed">>></button>
            <button class="" [disabled]="!isValid" (click)="prepareAck()">Ack</button>
            <button class="" [disabled]="!isValid" (click)="preparePartialFill()">Partial Fill</button>
            <button class="" [disabled]="!isValid" (click)="prepareFill()">Fill</button>
            <button class="" [disabled]="!isValid" (click)="prepareReject()">Reject</button>

            <button class="" 
                 *ngFor="let action of customActions"
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
                (click)="addAction()"
            >+</button>

        </div>
        <div class="keyvalue-section" [hidden]="collapsed">
            <table class="keyvalue-table">
                <tr>
                    <td></td>
                    <td><button class="send" (click)="send()">Send</button></td>
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

        .keyvalue-section {
            overflow: auto;
            border-collapse: collapse;
            margin-left: 6px;
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
            font-size: 12px; 
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

    constructor(
        private clientsService: SessionService,
        private apiDataService: TransactionApiService,
        private fixParserService: FixParserService) {
        this.isValid = true;
        this.socket = io();
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "detail" && changedProp.currentValue != undefined) {
                this.transaction = changedProp.currentValue;
                this.sourceFixObj = this.fixParserService.parseFix(this.transaction.message);
                this.isValid = true;
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                this.collapsed = changedProp.currentValue;
            }
        }
    }

    private addAction() {
        let newAction = { label: "", isEditing: true };
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

        if (this.collapsed) {
            this.send();
        }
    }

    private prepareAck() {
        let orderID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();

        this.fixToSend = {
            "OrderID": this.sourceFixObj["ClOrdID (11)"],,
            "ClOrdID": this.sourceFixObj["ClOrdID (11)"],
            "ExecID": execID,
            "ExecTransType": 0,
            "ExecType": 0,
            "OrdStatus": 0,
            "Symbol": this.sourceFixObj["Symbol (55)"],
            "SecurityExchange": "New York",
            "Side": 1,
            "OrderQty": this.sourceFixObj["OrderQty (38)"],
            "OrdType": 1,
            "Price": 4.6,
            "TimeInForce": 0,
            "LastShares": 0,
            "LastPx": 4.4,
            "LeavesQty": 0,
            "CumQty": 0,
            "AvgPx": 4.5,
            "TransactTime": "now",
            "HandlInst": 3
        }
        this.displayFixMessage();
    }

    private prepareFill() {
        let orderID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();

        this.fixToSend = {
            "OrderID": this.sourceFixObj["ClOrdID (11)"],
            "ClOrdID": this.sourceFixObj["ClOrdID (11)"],
            "ExecID": execID,
            "ExecTransType": 0,
            "ExecType": 2,
            "OrdStatus": 2,
            "Symbol": this.sourceFixObj["Symbol (55)"],
            "SecurityExchange": "New York",
            "Side": 1,
            "OrderQty": this.sourceFixObj["OrderQty (38)"],
            "OrdType": 1,
            "Price": 4.6,
            "TimeInForce": 0,
            "LastShares": 0,
            "LastPx": 4.4,
            "LeavesQty": 0,
            "CumQty": this.sourceFixObj["OrderQty (38)"],
            "AvgPx": 4.5,
            "TransactTime": "now",
            "HandlInst": 3
        }
        this.displayFixMessage();
    }

    private preparePartialFill() {
        let orderID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();
        let execID = (Math.random().toString(36) + '00000000000000000').slice(2, 11 + 2).toUpperCase();

        this.fixToSend = {
            "OrderID": this.sourceFixObj["ClOrdID (11)"],
            "ClOrdID": this.sourceFixObj["ClOrdID (11)"],
            "ExecID": execID,
            "ExecTransType": 0,
            "ExecType": 0,
            "OrdStatus": 0,
            "Symbol": this.sourceFixObj["Symbol (55)"],
            "SecurityExchange": "New York",
            "Side": 1,
            "OrderQty": this.sourceFixObj["OrderQty (38)"],
            "OrdType": 1,
            "Price": 4.6,
            "TimeInForce": 0,
            "LastShares": 0,
            "LastPx": 4.4,
            "LeavesQty": 0,
            "CumQty": 10,
            "AvgPx": 4.5,
            "TransactTime": "now",
            "HandlInst": 3
        }
        this.displayFixMessage();
    }

    private prepareReject() {

        this.fixToSend = {
            "MsgType": 3,
            "RefSeqNum": this.sourceFixObj['MsgSeqNum (34)']
        }
        this.displayFixMessage();
    }

    private send() {
        this.apiDataService.createTransaction(this.session.name, this.fixToSend);
    }

    ngOnInit() {

    }

}
