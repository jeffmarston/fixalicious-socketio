import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { GridOptions } from 'ag-grid/main';
import { ApiService } from "../../services/api.service";
import { FixParserService } from "../../services/fix-parser.service"
import { ScenarioService } from "../../services/scenario.service"
import { ITransaction, ISession } from "../../types.d";
import * as io from 'socket.io-client';
import * as _ from 'lodash';

@Component({
    selector: 'message-grid',
    templateUrl: 'app/components/message-grid/message-grid.component.html',
    styleUrls: ['app/components/message-grid/message-grid.component.css'],
    providers: [ApiService]
})
export class MessageGridComponent implements OnInit {
    @Input() session: ISession;

    private gridOptions: GridOptions;
    private showGrid: boolean;
    private rowData: ITransaction[];
    private visibleRows: ITransaction[];
    private columnDefs: any[];
    private selectedSession: ISession;
    private selectedMessage: ITransaction;
    private showDetails: boolean;
    private debugMessage: string;
    private detailCollapsed = false;
    private splitSize = 70;
    private filterValue;
    private socket;

    ngOnInit() {
        this.showGrid = true;
        this.splitSize = parseInt(localStorage.getItem("split-size") || "70");

        this.socket = io();
        this.socket.on('transaction', msg => {
            let transaction: ITransaction = JSON.parse(msg);
            if (transaction.session.toLowerCase() === this.selectedSession.session.toLowerCase()) {
                this.addRowsToDataSource([transaction]);
            }
        });
    }

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService,
        private scenarioService: ScenarioService,
        private http: Http) {

        this.createColumnDefs();
        this.gridOptions = <GridOptions>{
            columnDefs: this.columnDefs
        };
    }

    private updateFilter($event) {
        this.visibleRows = this.filterOut(this.rowData, $event);
        this.gridOptions.api.setRowData(this.visibleRows);
    }

    private filterOut(rowdata: ITransaction[], filterValue: string) {
        let result = rowdata;
        if (filterValue) {
            result = _.filter(rowdata, o => {
                return (o.cliOrdId) && (o.cliOrdId.indexOf(filterValue) > -1);
            });
        }
        return result;
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "session") {
                this.selectedSession = changedProp.currentValue;
                this.rowData = null;
                this.filterValue = null;
                this.fetchRowData(changedProp.currentValue);
            }
        }
    }

    private saveSessionConfig(session: ISession) {
        alert("not implemented");
    }

    private createColumnDefs() {
        this.columnDefs = [
            { headerName: "Direction", field: "direction" },
            { headerName: "Message Type", field: "msgType" },
            { headerName: "Seq Num", field: "seqNum" },
            { headerName: "CliOrdId", field: "cliOrdId" },
            { headerName: "Symbol", field: "symbol" },
            { headerName: "OrdStatus", field: "ordStatus" },
            { headerName: "Message", field: "message" }
        ];
    }

    private fetchRowData(session: ISession) {
        if (session) {
            var src = this.apiService.getTransactions(session.session);
            src.subscribe(o => {
                this.addRowsToDataSource(o);
            }, error => {
                console.error("ERROR: " + error);
            });
        }
    }

    private getValueFromTag(array, tag){
        let item = _.find(array, o=> o.Tag===tag);
        return (item) ? item.Value : null;
    }

    private createRow(item): ITransaction {
        let row = {
            direction: item.direction ? "sent" : "received",
            seqNum: null,
            cliOrdId: null,
            msgType: null,
            ordStatus: null,
            symbol: null,
            message: this.fixParserService.stringify(item.message),
            original: item
        };
        // enrich with specifics from fix message
        try {
            row.seqNum = this.getValueFromTag(item.message.header, 34);  // ['MsgSeqNum (34)'];
            row.cliOrdId = this.getValueFromTag(item.message.body, 11);  // ['ClOrdID (11)'];
            row.msgType = this.getValueFromTag(item.message.header, 35);  // ['MsgType (35)'];
            row.ordStatus = this.getValueFromTag(item.message.body, 39);  // ['OrdStatus (39)'];
            row.symbol = this.getValueFromTag(item.message.body, 55);  // ['Symbol (55)'];
        }
        catch (ex) {
            console.error("Unable to parse FIX: " + JSON.stringify(item));
        }
        return row;
    }

    private addRowsToDataSource(newItems: ITransaction[]) {
        // First process te raw message and transform raw message into a row
        let newRows = [];
        newItems.forEach(item => {
            newRows.push(this.createRow(item));
        });

        if (!this.rowData) {
            this.rowData = newRows;
            this.visibleRows = this.filterOut(this.rowData, this.filterValue);
            this.gridOptions.api.setRowData(this.visibleRows);
        } else {
            let newVisRows = this.filterOut(newRows, this.filterValue);

            this.gridOptions.api.updateRowData({ add: newVisRows, addIndex: 0 });
        }


        // resize columns 
        var allColumnIds = [];
        this.columnDefs.forEach(function (columnDef) {
            allColumnIds.push(columnDef.field);
        });
        this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
    }

    private onResize() {
        this.gridOptions.api.doLayout();
    }

    private onCellClicked($event) {
        this.selectedMessage = $event.data;
    }

    private toggleDetails() {
        this.detailCollapsed = !this.detailCollapsed;
    }
}
