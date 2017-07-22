import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { GridOptions } from 'ag-grid/main';
import { ApiService } from "../../services/api.service";
import { FixParserService } from "../../services/fix-parser.service"
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
    private filterValue = null;
    private bufferSize = 500;
    private splitConfig: any;

    ngOnInit() {
        this.showGrid = true;
        let savedStr = localStorage.getItem("splitConfig");
        this.splitConfig = savedStr ? JSON.parse(savedStr) : { collapsed: false, collapsedSize: 90, expandedSize: 60 };
        this.splitSize = parseInt(this.splitConfig.collapsed ? this.splitConfig.collapsedSize : this.splitConfig.expandedSize);

        let socket = io();
        socket.on('transaction', msg => {
            let transaction: ITransaction = JSON.parse(msg);
            if (transaction.session.toLowerCase() === this.selectedSession.session.toLowerCase()) {
                this.addRowsToDataSource([transaction]);
            }
        });
    }

    constructor(
        private apiService: ApiService,
        private fixParserService: FixParserService,
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

    private getValueFromTag(array, tag) {
        let item = _.find(array, o => o.Tag === tag);
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
            message: JSON.stringify(item.message),
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
        // First process the raw message and transform raw message into a row
        let newRows = [];
        newItems.forEach(item => {
            newRows.push(this.createRow(item));
        });

        // visibleRows is how the custom filtering is implemented
        if (!this.rowData) {
            this.rowData = newRows;
            this.visibleRows = this.filterOut(this.rowData, this.filterValue);
            this.gridOptions.api.setRowData(this.visibleRows);
        } else {
            this.rowData = this.rowData.concat(newRows);
            let newVisRows = this.filterOut(newRows, this.filterValue);
            this.gridOptions.api.updateRowData({ add: newVisRows, addIndex: 0 });
        }

        // limit grid to (bufferSize) lines
        let rowsToRemove = [];
        while (this.rowData.length > this.bufferSize) {
            rowsToRemove.push(this.rowData.shift());
        }
        this.gridOptions.api.updateRowData({ remove: rowsToRemove });

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

    private saveSize($event) {
        if (this.splitConfig.collapsed) {
            this.splitConfig.collapsedSize = Math.trunc($event[0]);
        } else {
            this.splitConfig.expandedSize = Math.trunc($event[0]);
        }
        localStorage.setItem("splitConfig", JSON.stringify(this.splitConfig));
    }

    private splitterSizing($event) {
        // "snap" to one view or other as splitter is draggeed within range
        this.detailCollapsed = ($event[0] > 80);
    }

    private onCollapse($event: boolean) {
        if ($event) {
            this.splitConfig.collapsed = true;
            this.splitSize = this.splitConfig.collapsedSize;
        } else {
            this.splitConfig.collapsed = false;
            this.splitSize = this.splitConfig.expandedSize;
        }
    }
}
