import { Component, OnInit, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { SessionService } from "../../services/session.service"
import { TransactionApiService } from "../../services/transaction.service"
import { ISession, IFixMessage, ITransaction } from "../../types.d"

@Component({
    selector: 'detail-pane',
    template: `
    <div class="container" [style.width]="collapsed ? '0' : '330px'" > 
        <div class="button-section">
            <button class="first" [disabled]="!isValid" (click)="ackFixMessage()">Ack</button>
            <button [disabled]="true">Reject</button>
            <button [disabled]="true">Fill</button>
            <button class="last" [disabled]="true">Partial Fill</button>
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
            display: flex;
            flex-direction: column;
        }

        .button-section {
            display: flex;
            flex-direction: row;
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
            padding: 2px;
            margin: 0;  
            width: 69px;
            font-size: 12px; 
            border: 1px gray solid; 
            border-left: none;
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

    constructor(
        private clientsService: SessionService,
        private apiDataService: TransactionApiService) {
                this.isValid = true;
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
                    value: fixMsg[property]});
            }
        }
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
