import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { GridOptions } from 'ag-grid/main';
import { TransactionApiService } from "../../services/transaction.service"
import { SessionService } from "../../services/session.service"
import { ITransaction, ISession } from "../../types.d"

@Component({
    selector: 'message-grid',
    templateUrl: 'app/components/message-grid/message-grid.component.html',
    styleUrls: ['app/components/message-grid/message-grid.component.css'],
    providers: [TransactionApiService]
})
export class SimpleGridComponent implements OnInit {
    @Input() session: ISession;

    private gridOptions: GridOptions;
    private showGrid: boolean;
    private rowData: ITransaction[];
    private columnDefs: any[];
    private selectedSession: ISession;
    private selectedMessage: ITransaction;
    private showDetails: boolean;
    private debugMessage: string;
    private detailCollapsed = false;

    ngOnInit() {
        this.showGrid = true;
    }

    constructor(
        private apiDataService: TransactionApiService,
        private sessionService: SessionService,
        private http: Http) {

        this.createColumnDefs();
        this.gridOptions = <GridOptions>{
            columnDefs: this.columnDefs
        };

        // setInterval(o => {
        //     this.detailCollapsed = !this.detailCollapsed;
        //     console.log(this.detailCollapsed);
        // }, 1000);

        // setTimeout(o=> {
        //     console.log("adding: " + this.selectedMessage.id);
        //         this.addRowsToDataSource([this.selectedMessage]);
        // }, 4000);
    }

    private ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "session") {
                this.selectedSession = changedProp.currentValue;
                this.rowData = null;
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
            { headerName: "OrdStatus", field: "ordStatus" },
            { headerName: "Message", field: "message" }
        ];
    }

    private fetchRowData(session: ISession) {
        var src = this.apiDataService.getTransactions(session.name);
        src.subscribe(o => {
            this.addRowsToDataSource(o);
        }, error => {
            console.error("ERROR: " + error);
        });
    }

    private createRow(item): ITransaction {
        let row = {
            direction: item.direction,
            seqNum: null,
            cliOrdId: "",
            msgType: "",
            ordStatus: "",
            message: item.message
        };
        // enrich with specifics from fix message
        try {
            let fixObj = JSON.parse(item.message);
            row.seqNum = fixObj['MsgSeqNum (34)'];
            row.cliOrdId = fixObj['ClOrdID (11)'];
            row.msgType = fixObj['MsgType (35)'];
            row.ordStatus = fixObj['OrdStatus (39)'];
            row.message = item.message;
        }
        catch (ex) {
            console.error("Unable to parse json: " + item.message);
        }
        return row;
    }

    private addRowsToDataSource(newItems: ITransaction[]) {
        let rows = [];
        newItems.forEach(item => {
            rows.push(this.createRow(item));
        });

        if (!this.rowData) {
            this.rowData = rows;
        }
        this.gridOptions.api.insertItemsAtIndex(0, rows);


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
        console.log(this.detailCollapsed);
        this.detailCollapsed = !this.detailCollapsed;
    }
}
