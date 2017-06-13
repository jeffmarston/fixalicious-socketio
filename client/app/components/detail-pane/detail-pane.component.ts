import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { SessionService } from "../../services/session.service"
import { TransactionApiService } from "../../services/transaction.service"
import { ISession, IFixMessage, ITransaction } from "../../types.d"
import * as io from 'socket.io-client';

@Component({
    selector: 'detail-pane',
    template: `
    <div class="container" [style.width]="collapsed ? '0' : '330px'" > 
        <div class="button-section">
            <button class="" [disabled]="!isValid" (click)="sendDummy()">Send</button>
            <button class="middle" [hidden]="true">Reject</button>
            <button class="middle" [hidden]="true">Fill</button>
            <button class="last" [hidden]="true">Partial Fill</button>
        </div>
        <div class="keyvalue-section">
            <table class="keyvalue-table">
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
            height: 100%;
            overflow: hidden;
            transition: width .25s ease;
            width: 25%;
            float: left;
        }

        .button-section {
            display: flex;
            flex-direction: row;
            padding-left: 4px;
            height: 25px;
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
            padding: 2px;
            margin: 0;  
            width: 69px;
            font-size: 12px; 
            border: 1px gray solid; 
            border-radius: 4px;
        }

        button:hover {
            background: #eee;
            cursor: pointer;
        }

        .middle {
            border-left: none;
            border-radius: 0;
        }

        .first {
            border-left: 1px gray solid; 
            border-radius: 4px 0 0 4px;
        }

        .last {
            border-radius: 0 4px 4px 0;
        }

        li:hover:not(.active) {
            background-color: #36424B;
        }

    `],
    providers: [SessionService]
})
export class DetailPane implements OnInit {
    @Input() detail: ITransaction;
    @Input() collapsed: boolean;
    @Input() session: ISession;

    private transaction: ITransaction;
    private isValid: boolean;
    private kvPairs: any[] = [];
    private socket;

    constructor(
        private clientsService: SessionService,
        private apiDataService: TransactionApiService) {
        this.isValid = true;
        this.socket = io();
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "detail" && changedProp.currentValue != undefined) {
                this.transaction = changedProp.currentValue;
                this.displayFixMessage();
                this.isValid = true;
            }
            if (propName == "collapsed" && changedProp.currentValue != undefined) {
                this.collapsed = changedProp.currentValue;
            }
        }
    }

    private displayFixMessage() {
        this.kvPairs = [];
        var fixMsg = JSON.parse(this.transaction.message);
        for (var property in fixMsg) {
            if (fixMsg.hasOwnProperty(property)) {
                this.kvPairs.push({
                    key: property,
                    value: fixMsg[property]
                });
            }
        }
    }

    private sendDummy() {
        //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let cliOrdId = (Math.random().toString(36)+'00000000000000000').slice(2, 11+2).toUpperCase();
        let symbol = cliOrdId.substring(0, 3);

        let dummyMsg = {
            "BeginString (8)": "FIX.4.2",
            "BodyLength (9)": "138",
            "MsgType (35)": "D",
            "MsgSeqNum (34)": "35",
            "SenderCompID (49)": "Jeff",
            "TargetCompID (56)": "Marston",
            "SendingTime (52)": new Date().toISOString(),
            "TransactTime (60)": new Date().toISOString(),
            "SecurityExchange (207)": "New York",
            "HandlInst (21)": "MANUAL_ORDER_BEST_EXECUTION (3)",
            "Symbol (55)": symbol,
            "Side (54)": "BUY (1)",
            "ClOrdID (11)": cliOrdId,
            "Price (44)": "0",
            "TimeInForce (59)": "DAY (0)",
            "OrdType (40)": "MARKET (1)",
            "OrderQty (38)": Math.floor((Math.random() * 1000) + 100),
            "CheckSum (10)": "251"
        }
        this.apiDataService.createTransaction(this.session.name, dummyMsg);
    }

    private ackFixMessage() {
        var fixObj = {};
        this.kvPairs.forEach(pair => {
            fixObj[pair.key] = pair.value;
        });

        console.log(" ==== SENDING =====");
        console.log(fixObj);

        this.apiDataService.createTransaction(this.session.name, fixObj);
    }

    ngOnInit() {

    }

}
