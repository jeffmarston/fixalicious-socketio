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

        // setTimeout(o=> {
        //     console.log("adding: " + this.selectedMessage.id);
        //         this.addRowsToDataSource([this.selectedMessage]);
        // }, 4000);
    }

    private ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        for (let propName in changes) {
            let changedProp = changes[propName];

            if (propName == "session") {
                this.selectedSession = changedProp.currentValue;
                this.rowData = null;
                this.createRowData(changedProp.currentValue);
            }
        }
    }

    private saveSessionConfig(session: ISession) {  
        alert("not implemented");
    }

    private createColumnDefs() {
        this.columnDefs = [
            { headerName: "Direction", field: "direction" },
            { headerName: "Id", field: "id" },
            { headerName: "Message", field: "message" }
        ];
    }

    private createRowData(session: ISession) {       
        var src = this.apiDataService.getTransactions(session.name);
        src.subscribe(o => {
            this.addRowsToDataSource(o);
        }, error => {
            console.error("ERROR: " + error);
        });
    }

    private addRowsToDataSource(newItems: ITransaction[]) {
        if (!this.rowData) {
            this.rowData = newItems;
        }
        this.gridOptions.api.insertItemsAtIndex(0, newItems);

        newItems.forEach(item => {
            item.pretty_message = "";
            let obj = JSON.parse(item.message);
            for(let propt in obj) {
                item.pretty_message += propt + ': ' + obj[propt] + "\n";
            }

            this.rowData.splice(0, 0, item);
        });
    }

    private onCellClicked($event) {
        this.selectedMessage = $event.data;
    }

    private onRowClick(row) {
        this.selectedMessage = row;
    }
}
