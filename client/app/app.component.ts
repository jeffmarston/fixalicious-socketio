import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";
//import { TransactionApiService } from "./services/transaction.service"

@Component({
    selector: 'my-app',
    template: `
    <div class="app-container">

        <div class="header-bar">
            <div class="collapse-button" (click)="toggleNavBar()">
                <i class="fa fa-glass" aria-hidden="true"></i>
            </div>
            <h1>FIXalicious</h1>
        </div>

        <session-nav
            [collapsed]="isNavCollapsed"
            (onSelected)="onSelected($event)"
        ></session-nav>

        <div class="app-content">
            <div class="flex-row">
                <message-grid 
                    style="flex: 1 1 auto;"
                    [session]="session">
                </message-grid>
            </div>

            <!-- <detail-pane></detail-pane> -->

        </div>
    </div>
    `,
    styles: [` 
        .app-container { 
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .app-content { 
            display: flex;
            flex-direction: row;
            flex: 1 1 auto;
        }
        h1 {
            display: inline;
        }
        .collapse-button {
            font-size: 16px;
            display: inline;
            cursor: pointer;
            margin-right: 10px;
        }
        .flex-row {
            display:flex;
            flex-direction: row;
            flex: 1 1 auto;
        }
    `]
})
export class AppComponent {
    private connectionState$: Observable<string>;
    private session: string = "BAX";
    private isNavCollapsed: boolean;

    ngOnInit() {
    }

    toggleNavBar(){
        this.isNavCollapsed = !this.isNavCollapsed;
    }

    onSelected($event) {
        this.session = $event;        
    }
}
